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

    /**
     * Whether this category shows in the public "Browse by Category" tile
     * grid — deliberately separate from isActive, which governs whether the
     * category is usable at all (selectable in admin forms, appears in
     * filter dropdowns). Hiding a category from the browse grid must not
     * deactivate it.
     */
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean visibleOnPublicPage;

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
        if (visibleOnPublicPage == null) {
            visibleOnPublicPage = true;
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
