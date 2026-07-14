package com.travesrilankanow.travesrilankanowbe.entity;

import com.travesrilankanow.travesrilankanowbe.entity.converter.JsonMapConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    private String imageUrl; // nullable — video slides have no image

    // "image" (default) or "video"
    @Column(nullable = false, columnDefinition = "varchar(10) default 'image'")
    private String mediaType = "image";

    // Direct video URL (MP4/WebM) — used when mediaType = "video"
    private String videoUrl;

    // Per-slide text styling stored as JSON — font, size, color, shadow, etc.
    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonMapConverter.class)
    private Map<String, Object> titleStyle;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonMapConverter.class)
    private Map<String, Object> subtitleStyle;

    // "left" | "center" | "right" — position of the text block on the slide
    @Column(nullable = false, columnDefinition = "varchar(10) default 'center'")
    private String contentAlign = "center";

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

    /** Populated at query time for the public API — not stored in DB. */
    @Transient
    private List<Map<String, String>> galleryImages;

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
