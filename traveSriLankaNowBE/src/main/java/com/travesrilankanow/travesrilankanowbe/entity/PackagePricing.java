package com.travesrilankanow.travesrilankanowbe.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "package_pricing", indexes = {
    @Index(name = "idx_package_pricing_package", columnList = "package_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackagePricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TourPackage pkg;

    @Column(nullable = false, length = 10)
    private String currencyCode;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PricingType pricingType;

    @Deprecated
    private Integer groupSize; // legacy — kept for backward compat; use groupSizeMin/Max

    private Integer groupSizeMin;
    private Integer groupSizeMax;

    @Column(length = 100)
    private String label;

    @Column(nullable = false)
    private Boolean isPrimary;

    @Column(nullable = false)
    private Integer displayOrder;

    @PrePersist
    void setDefaults() {
        if (isPrimary == null) isPrimary = false;
        if (displayOrder == null) displayOrder = 0;
        if (pricingType == null) pricingType = PricingType.PER_PERSON;
        if (currencyCode == null) currencyCode = "USD";
    }

    public enum PricingType {
        PER_PERSON, GROUP, FULL_EVENT
    }
}
