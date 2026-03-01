package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "page_header_backgrounds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageHeaderBackground {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PageType pageType;

    @Column(nullable = false)
    private String imageUrl;

    private String title;

    @Column(nullable = false)
    private String overlayColor = "rgba(28, 77, 141, 0.7)";

    @Column(nullable = false)
    private Double overlayOpacity = 0.7;

    @Column(nullable = false)
    private Boolean isActive = false;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (displayOrder == null) displayOrder = 0;
        if (isActive == null) isActive = false;
        if (overlayColor == null) overlayColor = "rgba(28, 77, 141, 0.7)";
        if (overlayOpacity == null) overlayOpacity = 0.7;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
