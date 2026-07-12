package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceFormDto {
    private Long id;
    private Long companyId;
    private String companyName;
    private String name;
    private String description;
    private Integer version;
    private Boolean isActive;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<InvoiceFormFieldDto> fields;
}
