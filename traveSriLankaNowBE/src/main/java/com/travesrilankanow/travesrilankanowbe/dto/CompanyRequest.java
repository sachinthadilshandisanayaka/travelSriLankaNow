package com.travesrilankanow.travesrilankanowbe.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CompanyRequest {
    @NotBlank
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
    private String currency;
    private String taxLabel;
    private String bankName;
    private String bankAccountNo;
    private String bankSwift;
    private Integer paymentTermsDays;
    private String termsConditions;
    private String invoicePrefix;
    private String brevoFromName;
    private String brevoFromEmail;
}
