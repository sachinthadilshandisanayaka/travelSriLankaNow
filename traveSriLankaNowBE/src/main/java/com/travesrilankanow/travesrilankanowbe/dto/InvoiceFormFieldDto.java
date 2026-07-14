package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceFormFieldDto {
    private Long id;
    private String fieldKey;
    private String jasperParamName;
    private String label;
    private String fieldType;
    private String placeholder;
    private String defaultValue;
    private Boolean isRequired;
    private Boolean isLineItem;
    private Integer sortOrder;
    private List<Map<String, String>> options;
    private Map<String, Object> validationRules;
    private String section;
}
