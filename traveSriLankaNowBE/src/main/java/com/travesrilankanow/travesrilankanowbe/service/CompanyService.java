package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.*;
import com.travesrilankanow.travesrilankanowbe.entity.*;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepo;
    private final CompanyUserRepository companyUserRepo;
    private final CompanyChangeLogRepository changeLogRepo;
    private final UserRepository userRepo;
    private final CloudinaryService cloudinaryService;

    public List<CompanyDto> getAllCompanies() {
        return companyRepo.findByIsActiveTrueOrderByNameAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public CompanyDto getById(Long id) {
        return toDto(findCompany(id));
    }

    public Optional<CompanyDto> getCompanyForUser(String username) {
        return userRepo.findByUsername(username)
                .flatMap(u -> companyUserRepo.findByUser_Id(u.getId()))
                .map(cu -> toDto(cu.getCompany()));
    }

    @Transactional
    public CompanyDto create(CompanyRequest request) {
        Company company = Company.builder()
                .name(request.getName())
                .regNumber(request.getRegNumber())
                .taxId(request.getTaxId())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .country(request.getCountry() != null ? request.getCountry() : "Sri Lanka")
                .phone(request.getPhone())
                .email(request.getEmail())
                .website(request.getWebsite())
                .currency(request.getCurrency() != null ? request.getCurrency() : "LKR")
                .taxLabel(request.getTaxLabel() != null ? request.getTaxLabel() : "VAT")
                .bankName(request.getBankName())
                .bankAccountNo(request.getBankAccountNo())
                .bankSwift(request.getBankSwift())
                .paymentTermsDays(request.getPaymentTermsDays() != null ? request.getPaymentTermsDays() : 30)
                .termsConditions(request.getTermsConditions())
                .invoicePrefix(request.getInvoicePrefix() != null ? request.getInvoicePrefix() : "INV")
                .brevoFromName(request.getBrevoFromName())
                .brevoFromEmail(request.getBrevoFromEmail())
                .build();
        return toDto(companyRepo.save(company));
    }

    @Transactional
    public CompanyDto update(Long id, CompanyRequest request, String changedBy) {
        Company existing = findCompany(id);
        String ipAddress = currentIp();

        recordChange(existing, "name",           existing.getName(),           request.getName(),           changedBy, ipAddress);
        recordChange(existing, "regNumber",      existing.getRegNumber(),      request.getRegNumber(),      changedBy, ipAddress);
        recordChange(existing, "taxId",          existing.getTaxId(),          request.getTaxId(),          changedBy, ipAddress);
        recordChange(existing, "addressLine1",   existing.getAddressLine1(),   request.getAddressLine1(),   changedBy, ipAddress);
        recordChange(existing, "addressLine2",   existing.getAddressLine2(),   request.getAddressLine2(),   changedBy, ipAddress);
        recordChange(existing, "city",           existing.getCity(),           request.getCity(),           changedBy, ipAddress);
        recordChange(existing, "country",        existing.getCountry(),        request.getCountry(),        changedBy, ipAddress);
        recordChange(existing, "phone",          existing.getPhone(),          request.getPhone(),          changedBy, ipAddress);
        recordChange(existing, "email",          existing.getEmail(),          request.getEmail(),          changedBy, ipAddress);
        recordChange(existing, "website",        existing.getWebsite(),        request.getWebsite(),        changedBy, ipAddress);
        recordChange(existing, "currency",       existing.getCurrency(),       request.getCurrency(),       changedBy, ipAddress);
        recordChange(existing, "taxLabel",       existing.getTaxLabel(),       request.getTaxLabel(),       changedBy, ipAddress);
        recordChange(existing, "bankName",       existing.getBankName(),       request.getBankName(),       changedBy, ipAddress);
        recordChange(existing, "bankAccountNo",  existing.getBankAccountNo(),  request.getBankAccountNo(),  changedBy, ipAddress);
        recordChange(existing, "bankSwift",      existing.getBankSwift(),      request.getBankSwift(),      changedBy, ipAddress);
        recordChange(existing, "invoicePrefix",  existing.getInvoicePrefix(),  request.getInvoicePrefix(),  changedBy, ipAddress);
        recordChange(existing, "brevoFromName",  existing.getBrevoFromName(),  request.getBrevoFromName(),  changedBy, ipAddress);
        recordChange(existing, "brevoFromEmail", existing.getBrevoFromEmail(), request.getBrevoFromEmail(), changedBy, ipAddress);

        if (request.getName() != null)           existing.setName(request.getName());
        if (request.getRegNumber() != null)      existing.setRegNumber(request.getRegNumber());
        if (request.getTaxId() != null)          existing.setTaxId(request.getTaxId());
        if (request.getAddressLine1() != null)   existing.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null)   existing.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null)           existing.setCity(request.getCity());
        if (request.getCountry() != null)        existing.setCountry(request.getCountry());
        if (request.getPhone() != null)          existing.setPhone(request.getPhone());
        if (request.getEmail() != null)          existing.setEmail(request.getEmail());
        if (request.getWebsite() != null)        existing.setWebsite(request.getWebsite());
        if (request.getCurrency() != null)       existing.setCurrency(request.getCurrency());
        if (request.getTaxLabel() != null)       existing.setTaxLabel(request.getTaxLabel());
        if (request.getBankName() != null)       existing.setBankName(request.getBankName());
        if (request.getBankAccountNo() != null)  existing.setBankAccountNo(request.getBankAccountNo());
        if (request.getBankSwift() != null)      existing.setBankSwift(request.getBankSwift());
        if (request.getPaymentTermsDays() != null) existing.setPaymentTermsDays(request.getPaymentTermsDays());
        if (request.getTermsConditions() != null) existing.setTermsConditions(request.getTermsConditions());
        if (request.getInvoicePrefix() != null)  existing.setInvoicePrefix(request.getInvoicePrefix());
        if (request.getBrevoFromName() != null)  existing.setBrevoFromName(request.getBrevoFromName());
        if (request.getBrevoFromEmail() != null) existing.setBrevoFromEmail(request.getBrevoFromEmail());

        return toDto(companyRepo.save(existing));
    }

    @Transactional
    public String uploadLogo(Long companyId, MultipartFile file) throws IOException {
        Company company = findCompany(companyId);
        Map<String, Object> result = cloudinaryService.uploadImage(file, "company-assets/" + companyId);
        company.setLogoUrl((String) result.get("url"));
        companyRepo.save(company);
        return (String) result.get("url");
    }

    @Transactional
    public String uploadSignature(Long companyId, MultipartFile file) throws IOException {
        Company company = findCompany(companyId);
        Map<String, Object> result = cloudinaryService.uploadImage(file, "company-assets/" + companyId);
        company.setSignatureUrl((String) result.get("url"));
        companyRepo.save(company);
        return (String) result.get("url");
    }

    @Transactional
    public void deactivate(Long id) {
        Company c = findCompany(id);
        c.setIsActive(false);
        companyRepo.save(c);
    }

    public List<AdminUserDto> getCompanyUsers(Long companyId) {
        return companyUserRepo.findByCompany_Id(companyId).stream()
                .map(cu -> {
                    User u = cu.getUser();
                    return AdminUserDto.builder()
                            .id(u.getId())
                            .username(u.getUsername())
                            .email(u.getEmail())
                            .firstName(u.getFirstName())
                            .lastName(u.getLastName())
                            .enabled(u.isEnabled())
                            .build();
                }).collect(Collectors.toList());
    }

    @Transactional
    public void assignUser(Long companyId, Long userId) {
        if (companyUserRepo.existsByCompany_IdAndUser_Id(companyId, userId)) return;
        Company company = findCompany(companyId);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        String assignedBy = SecurityContextHolder.getContext().getAuthentication().getName();
        CompanyUser cu = CompanyUser.builder()
                .company(company).user(user).assignedBy(assignedBy).build();
        companyUserRepo.save(cu);
    }

    @Transactional
    public void removeUser(Long companyId, Long userId) {
        companyUserRepo.deleteByCompany_IdAndUser_Id(companyId, userId);
    }

    public List<CompanyChangeLogDto> getChangeLog(Long companyId) {
        return changeLogRepo.findByCompany_IdOrderByChangedAtDesc(companyId)
                .stream().map(this::toChangeLogDto).collect(Collectors.toList());
    }

    // --- helpers ---

    private Company findCompany(Long id) {
        return companyRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + id));
    }

    private void recordChange(Company company, String field, String oldVal, String newVal,
                               String changedBy, String ipAddress) {
        if (Objects.equals(oldVal, newVal)) return;
        CompanyChangeLog log = CompanyChangeLog.builder()
                .company(company).fieldName(field)
                .oldValue(oldVal).newValue(newVal)
                .changedBy(changedBy).ipAddress(ipAddress)
                .build();
        changeLogRepo.save(log);
    }

    private String currentIp() {
        try {
            jakarta.servlet.http.HttpServletRequest request =
                    ((org.springframework.web.context.request.ServletRequestAttributes)
                            org.springframework.web.context.request.RequestContextHolder.getRequestAttributes())
                            .getRequest();
            String ip = request.getHeader("X-Forwarded-For");
            return (ip != null && !ip.isBlank()) ? ip.split(",")[0].trim() : request.getRemoteAddr();
        } catch (Exception e) {
            return "unknown";
        }
    }

    public CompanyDto toDto(Company c) {
        return CompanyDto.builder()
                .id(c.getId())
                .name(c.getName())
                .regNumber(c.getRegNumber())
                .taxId(c.getTaxId())
                .addressLine1(c.getAddressLine1())
                .addressLine2(c.getAddressLine2())
                .city(c.getCity())
                .country(c.getCountry())
                .phone(c.getPhone())
                .email(c.getEmail())
                .website(c.getWebsite())
                .logoUrl(c.getLogoUrl())
                .signatureUrl(c.getSignatureUrl())
                .currency(c.getCurrency())
                .taxLabel(c.getTaxLabel())
                .bankName(c.getBankName())
                .bankAccountNo(c.getBankAccountNo())
                .bankSwift(c.getBankSwift())
                .paymentTermsDays(c.getPaymentTermsDays())
                .termsConditions(c.getTermsConditions())
                .invoicePrefix(c.getInvoicePrefix())
                .invoiceSeq(c.getInvoiceSeq())
                .brevoFromName(c.getBrevoFromName())
                .brevoFromEmail(c.getBrevoFromEmail())
                .isActive(c.getIsActive())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private CompanyChangeLogDto toChangeLogDto(CompanyChangeLog l) {
        return CompanyChangeLogDto.builder()
                .id(l.getId())
                .companyId(l.getCompany().getId())
                .changedBy(l.getChangedBy())
                .changedAt(l.getChangedAt())
                .ipAddress(l.getIpAddress())
                .fieldName(l.getFieldName())
                .oldValue(l.getOldValue())
                .newValue(l.getNewValue())
                .build();
    }
}
