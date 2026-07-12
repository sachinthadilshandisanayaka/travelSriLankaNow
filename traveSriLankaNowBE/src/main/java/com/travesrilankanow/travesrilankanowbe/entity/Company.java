package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "reg_number", length = 100)
    private String regNumber;

    @Column(name = "tax_id", length = 100)
    private String taxId;

    @Column(name = "address_line1")
    private String addressLine1;

    @Column(name = "address_line2")
    private String addressLine2;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    @Builder.Default
    private String country = "Sri Lanka";

    @Column(length = 50)
    private String phone;

    @Column(length = 150)
    private String email;

    private String website;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "signature_url", columnDefinition = "TEXT")
    private String signatureUrl;

    @Column(length = 10)
    @Builder.Default
    private String currency = "LKR";

    @Column(name = "tax_label", length = 30)
    @Builder.Default
    private String taxLabel = "VAT";

    @Column(name = "bank_name", length = 150)
    private String bankName;

    @Column(name = "bank_account_no", length = 100)
    private String bankAccountNo;

    @Column(name = "bank_swift", length = 30)
    private String bankSwift;

    @Column(name = "payment_terms_days")
    @Builder.Default
    private Integer paymentTermsDays = 30;

    @Column(name = "terms_conditions", columnDefinition = "TEXT")
    private String termsConditions;

    @Column(name = "invoice_prefix", length = 20)
    @Builder.Default
    private String invoicePrefix = "INV";

    @Column(name = "invoice_seq")
    @Builder.Default
    private Long invoiceSeq = 0L;

    @Column(name = "brevo_from_name", length = 100)
    private String brevoFromName;

    @Column(name = "brevo_from_email", length = 150)
    private String brevoFromEmail;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
