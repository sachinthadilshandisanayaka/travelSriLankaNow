package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyDto {
    private Long id;
    private String name;
    private String regNumber;
    private String taxId;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String country;
    private String phone;
    private String email;
    private String website;
    private String logoUrl;
    private String signatureUrl;
    private String currency;
    private String taxLabel;
    private String bankName;
    private String bankAccountNo;
    private String bankSwift;
    private Integer paymentTermsDays;
    private String termsConditions;
    private String invoicePrefix;
    private Long invoiceSeq;
    private String brevoFromName;
    private String brevoFromEmail;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
