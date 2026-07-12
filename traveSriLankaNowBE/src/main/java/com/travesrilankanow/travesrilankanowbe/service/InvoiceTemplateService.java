package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.InvoiceTemplateDto;
import com.travesrilankanow.travesrilankanowbe.entity.Company;
import com.travesrilankanow.travesrilankanowbe.entity.CompanyTemplateAssignment;
import com.travesrilankanow.travesrilankanowbe.entity.InvoiceTemplate;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.CompanyRepository;
import com.travesrilankanow.travesrilankanowbe.repository.CompanyTemplateAssignmentRepository;
import com.travesrilankanow.travesrilankanowbe.repository.InvoiceTemplateRepository;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InvoiceTemplateService {

    private final InvoiceTemplateRepository templateRepo;
    private final CompanyRepository companyRepo;
    private final CompanyTemplateAssignmentRepository assignmentRepo;
    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.public-url}")
    private String publicUrl;

    public List<InvoiceTemplateDto> getAllTemplates() {
        return templateRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<InvoiceTemplateDto> getTemplatesForCompany(Long companyId) {
        return assignmentRepo.findActiveForCompany(companyId)
                .stream()
                .map(a -> toDto(a.getTemplate()))
                .collect(Collectors.toList());
    }

    public InvoiceTemplateDto getById(Long id) {
        return toDto(findTemplate(id));
    }

    @Transactional
    public InvoiceTemplateDto upload(MultipartFile file, String name,
                                     String description, Long companyId,
                                     String uploadedBy) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Template file is required");
        }

        String ext = getExtension(file.getOriginalFilename());
        String objectKey = "invoice-templates/" + UUID.randomUUID() + ext;

        minioClient.putObject(PutObjectArgs.builder()
                .bucket(bucketName)
                .object(objectKey)
                .stream(file.getInputStream(), file.getSize(), -1)
                .contentType(file.getContentType() != null ? file.getContentType() : "text/html")
                .build());

        String url = buildUrl(objectKey);

        int version = 1;
        List<InvoiceTemplate> existing = templateRepo.findAllByOrderByCreatedAtDesc();
        if (!existing.isEmpty()) {
            version = existing.stream().mapToInt(InvoiceTemplate::getVersion).max().orElse(0) + 1;
        }

        InvoiceTemplate template = InvoiceTemplate.builder()
                .name(name)
                .description(description)
                .templateUrl(url)
                .version(version)
                .isActive(true)
                .uploadedBy(uploadedBy)
                .build();

        InvoiceTemplate saved = templateRepo.save(template);

        // Auto-assign to company if provided
        if (companyId != null) {
            Company company = companyRepo.findById(companyId).orElse(null);
            if (company != null) {
                CompanyTemplateAssignment assignment = CompanyTemplateAssignment.builder()
                        .template(saved)
                        .company(company)
                        .isActive(true)
                        .assignedBy(uploadedBy)
                        .build();
                assignmentRepo.save(assignment);
            }
        }

        return toDto(saved);
    }

    @Transactional
    public InvoiceTemplateDto assignToCompany(Long templateId, Long companyId, String assignedBy) {
        InvoiceTemplate template = findTemplate(templateId);
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        // Upsert — if assignment already exists, activate it
        CompanyTemplateAssignment assignment = assignmentRepo
                .findByTemplate_IdAndCompany_Id(templateId, companyId)
                .orElseGet(() -> CompanyTemplateAssignment.builder()
                        .template(template)
                        .company(company)
                        .build());
        assignment.setIsActive(true);
        assignment.setAssignedBy(assignedBy);
        assignmentRepo.save(assignment);

        return toDto(template);
    }

    @Transactional
    public void removeAssignment(Long assignmentId) {
        CompanyTemplateAssignment a = assignmentRepo.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        a.setIsActive(false);
        assignmentRepo.save(a);
    }

    @Transactional
    public void deactivate(Long id) {
        InvoiceTemplate t = findTemplate(id);
        t.setIsActive(false);
        templateRepo.save(t);
    }

    private InvoiceTemplate findTemplate(Long id) {
        return templateRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found: " + id));
    }

    private String buildUrl(String objectKey) {
        return publicUrl.replaceAll("/+$", "") + "/" + bucketName + "/" + objectKey;
    }

    private String extractObjectKey(String url) {
        String prefix = publicUrl.replaceAll("/+$", "") + "/" + bucketName + "/";
        return url.startsWith(prefix) ? url.substring(prefix.length()) : url;
    }

    private String getExtension(String filename) {
        if (filename == null) return ".html";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : ".html";
    }

    public InvoiceTemplateDto toDto(InvoiceTemplate t) {
        List<InvoiceTemplateDto.AssignmentDto> assignments = assignmentRepo
                .findByTemplate_IdOrderByAssignedAtDesc(t.getId())
                .stream()
                .map(a -> InvoiceTemplateDto.AssignmentDto.builder()
                        .assignmentId(a.getId())
                        .companyId(a.getCompany().getId())
                        .companyName(a.getCompany().getName())
                        .isActive(a.getIsActive())
                        .assignedAt(a.getAssignedAt())
                        .assignedBy(a.getAssignedBy())
                        .build())
                .collect(Collectors.toList());

        return InvoiceTemplateDto.builder()
                .id(t.getId())
                .companyId(t.getCompany() != null ? t.getCompany().getId() : null)
                .companyName(t.getCompany() != null ? t.getCompany().getName() : null)
                .name(t.getName())
                .description(t.getDescription())
                .templateUrl(t.getTemplateUrl())
                .version(t.getVersion())
                .isActive(t.getIsActive())
                .uploadedBy(t.getUploadedBy())
                .createdAt(t.getCreatedAt())
                .assignments(assignments)
                .build();
    }
}
