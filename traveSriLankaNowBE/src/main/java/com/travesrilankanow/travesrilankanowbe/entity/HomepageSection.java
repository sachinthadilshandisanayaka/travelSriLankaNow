package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "homepage_sections", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"section_type"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "section_type", nullable = false, unique = true)
    private SectionType sectionType;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String config;

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

    public enum SectionType {
        HERO_SLIDER,
        FEATURED_LOCATIONS,
        UPCOMING_EVENTS,
        PLACES,
        SOCIAL_MEDIA
    }
}
