package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.InvoiceFormDto;
import com.travesrilankanow.travesrilankanowbe.dto.InvoiceFormFieldDto;
import com.travesrilankanow.travesrilankanowbe.entity.Company;
import com.travesrilankanow.travesrilankanowbe.entity.InvoiceForm;
import com.travesrilankanow.travesrilankanowbe.entity.InvoiceFormField;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.CompanyRepository;
import com.travesrilankanow.travesrilankanowbe.repository.InvoiceFormFieldRepository;
import com.travesrilankanow.travesrilankanowbe.repository.InvoiceFormRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InvoiceFormService {

    private final InvoiceFormRepository formRepo;
    private final InvoiceFormFieldRepository fieldRepo;
    private final CompanyRepository companyRepo;

    public List<InvoiceFormDto> getFormsForCompany(Long companyId) {
        return formRepo.findByCompany_IdAndIsActiveTrueOrderByNameAsc(companyId)
                .stream().map(f -> toDto(f, true)).collect(Collectors.toList());
    }

    public InvoiceFormDto getFormById(Long id) {
        return toDto(findForm(id), true);
    }

    @Transactional
    public InvoiceFormDto createForm(Long companyId, InvoiceFormDto request, String createdBy) {
        Company company = companyRepo.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + companyId));

        InvoiceForm form = InvoiceForm.builder()
                .company(company)
                .name(request.getName())
                .description(request.getDescription())
                .createdBy(createdBy)
                .build();

        InvoiceForm saved = formRepo.save(form);

        if (request.getFields() != null) {
            int order = 0;
            for (InvoiceFormFieldDto fieldDto : request.getFields()) {
                fieldDto.setSortOrder(order++);
                saveField(saved, fieldDto);
            }
        }

        return toDto(formRepo.findById(saved.getId()).orElseThrow(), true);
    }

    @Transactional
    public InvoiceFormDto updateForm(Long id, InvoiceFormDto request) {
        InvoiceForm form = findForm(id);
        if (request.getName() != null) form.setName(request.getName());
        if (request.getDescription() != null) form.setDescription(request.getDescription());
        form.setVersion(form.getVersion() + 1);
        formRepo.save(form);
        return toDto(form, true);
    }

    @Transactional
    public void deactivateForm(Long id) {
        InvoiceForm form = findForm(id);
        form.setIsActive(false);
        formRepo.save(form);
    }

    @Transactional
    public InvoiceFormFieldDto addField(Long formId, InvoiceFormFieldDto dto) {
        InvoiceForm form = findForm(formId);
        // determine next sort order
        int maxOrder = fieldRepo.findByForm_IdOrderBySortOrderAsc(formId).stream()
                .mapToInt(InvoiceFormField::getSortOrder).max().orElse(-1);
        dto.setSortOrder(maxOrder + 1);
        InvoiceFormField field = saveField(form, dto);
        return toFieldDto(field);
    }

    @Transactional
    public InvoiceFormFieldDto updateField(Long formId, Long fieldId, InvoiceFormFieldDto dto) {
        InvoiceFormField field = fieldRepo.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found: " + fieldId));
        if (!field.getForm().getId().equals(formId)) {
            throw new IllegalArgumentException("Field does not belong to form " + formId);
        }
        if (dto.getLabel() != null)           field.setLabel(dto.getLabel());
        if (dto.getFieldType() != null)       field.setFieldType(dto.getFieldType());
        if (dto.getPlaceholder() != null)     field.setPlaceholder(dto.getPlaceholder());
        if (dto.getDefaultValue() != null)    field.setDefaultValue(dto.getDefaultValue());
        if (dto.getIsRequired() != null)      field.setIsRequired(dto.getIsRequired());
        if (dto.getIsLineItem() != null)      field.setIsLineItem(dto.getIsLineItem());
        if (dto.getSortOrder() != null)       field.setSortOrder(dto.getSortOrder());
        if (dto.getOptions() != null)         field.setOptions(dto.getOptions());
        if (dto.getValidationRules() != null) field.setValidationRules(dto.getValidationRules());
        if (dto.getSection() != null)         field.setSection(dto.getSection());
        if (dto.getJasperParamName() != null) field.setJasperParamName(dto.getJasperParamName());
        return toFieldDto(fieldRepo.save(field));
    }

    @Transactional
    public void deleteField(Long formId, Long fieldId) {
        InvoiceFormField field = fieldRepo.findById(fieldId)
                .orElseThrow(() -> new ResourceNotFoundException("Field not found: " + fieldId));
        if (!field.getForm().getId().equals(formId)) {
            throw new IllegalArgumentException("Field does not belong to form " + formId);
        }
        fieldRepo.delete(field);
    }

    @Transactional
    public void reorderFields(Long formId, List<Long> fieldIds) {
        List<InvoiceFormField> fields = fieldRepo.findByForm_IdOrderBySortOrderAsc(formId);
        for (int i = 0; i < fieldIds.size(); i++) {
            final int order = i;
            final Long fid = fieldIds.get(i);
            fields.stream().filter(f -> f.getId().equals(fid))
                    .findFirst().ifPresent(f -> f.setSortOrder(order));
        }
        fieldRepo.saveAll(fields);
    }

    // --- helpers ---

    private InvoiceForm findForm(Long id) {
        return formRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Form not found: " + id));
    }

    private InvoiceFormField saveField(InvoiceForm form, InvoiceFormFieldDto dto) {
        InvoiceFormField field = InvoiceFormField.builder()
                .form(form)
                .fieldKey(dto.getFieldKey() != null ? dto.getFieldKey()
                        : dto.getLabel().toLowerCase().replaceAll("[^a-z0-9]", "_"))
                .jasperParamName(dto.getJasperParamName())
                .label(dto.getLabel())
                .fieldType(dto.getFieldType() != null ? dto.getFieldType() : "TEXT")
                .placeholder(dto.getPlaceholder())
                .defaultValue(dto.getDefaultValue())
                .isRequired(dto.getIsRequired() != null && dto.getIsRequired())
                .isLineItem(dto.getIsLineItem() != null && dto.getIsLineItem())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .options(dto.getOptions())
                .validationRules(dto.getValidationRules())
                .section(dto.getSection())
                .build();
        return fieldRepo.save(field);
    }

    public InvoiceFormDto toDto(InvoiceForm f, boolean includeFields) {
        InvoiceFormDto dto = InvoiceFormDto.builder()
                .id(f.getId())
                .companyId(f.getCompany().getId())
                .companyName(f.getCompany().getName())
                .name(f.getName())
                .description(f.getDescription())
                .version(f.getVersion())
                .isActive(f.getIsActive())
                .createdBy(f.getCreatedBy())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
        if (includeFields) {
            dto.setFields(fieldRepo.findByForm_IdOrderBySortOrderAsc(f.getId())
                    .stream().map(this::toFieldDto).collect(Collectors.toList()));
        }
        return dto;
    }

    public InvoiceFormFieldDto toFieldDto(InvoiceFormField f) {
        return InvoiceFormFieldDto.builder()
                .id(f.getId())
                .fieldKey(f.getFieldKey())
                .jasperParamName(f.getJasperParamName())
                .label(f.getLabel())
                .fieldType(f.getFieldType())
                .placeholder(f.getPlaceholder())
                .defaultValue(f.getDefaultValue())
                .isRequired(f.getIsRequired())
                .isLineItem(f.getIsLineItem())
                .sortOrder(f.getSortOrder())
                .options(f.getOptions())
                .validationRules(f.getValidationRules())
                .section(f.getSection())
                .build();
    }
}
