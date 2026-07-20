package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "master_data", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"type", "code"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MasterData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MasterDataType type;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String displayName;

    private String description;

    @Column(nullable = false)
    private Integer sortOrder;

    @Column(nullable = false)
    private Boolean isActive;

    private String color;

    private String icon;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isActive == null) {
            isActive = true;
        }
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum MasterDataType {
        EVENT_CATEGORY,
        PACKAGE_CATEGORY,
        LOCATION_CATEGORY,
        PLACE_TYPE,
        REGION,
        PRICE_RANGE,
        GALLERY_CATEGORY,
        GALLERY_TYPE,
        CURRENCY
    }
}
