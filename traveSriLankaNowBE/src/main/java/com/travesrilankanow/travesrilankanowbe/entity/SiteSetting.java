package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "site_settings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"setting_key"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SiteSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SettingCategory category;

    @Column(name = "setting_key", nullable = false, unique = true)
    private String key;

    @Column(nullable = false)
    private String label;

    @Column(columnDefinition = "TEXT")
    private String value;

    private String icon;

    private Integer sortOrder;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum SettingCategory {
        CONTACT_EMAIL,
        CONTACT_PHONE,
        CONTACT_ADDRESS,
        SOCIAL_MEDIA,
        BUSINESS_HOURS,
        GENERAL
    }
}
