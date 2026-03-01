package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hero_slides")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeroSlide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String subtitle;

    @Column(nullable = false)
    private String imageUrl;

    private String buttonText;

    private String buttonLink;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private Integer displayDuration = 5000; // Duration in milliseconds (default 5 seconds)

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (displayOrder == null) displayOrder = 0;
        if (active == null) active = true;
        if (displayDuration == null) displayDuration = 5000;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
