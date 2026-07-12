package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyChangeLogDto {
    private Long id;
    private Long companyId;
    private String changedBy;
    private LocalDateTime changedAt;
    private String ipAddress;
    private String fieldName;
    private String oldValue;
    private String newValue;
}
