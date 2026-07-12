package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gallery_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GalleryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String url;

    @Column(nullable = true)
    private String thumbnailUrl;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    private String location;

    @ElementCollection
    @CollectionTable(name = "gallery_tags", joinColumns = @JoinColumn(name = "gallery_item_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    private String photographer;

    @Column(nullable = false)
    private LocalDateTime uploadDate;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    @PrePersist
    private void setDefaults() {
        if (displayOrder == null) displayOrder = 0;
        if (featured == null) featured = false;
        if (uploadDate == null) uploadDate = LocalDateTime.now();
        // Fall back to url so the DB NOT NULL constraint is never violated
        if (thumbnailUrl == null || thumbnailUrl.isBlank()) thumbnailUrl = url;
    }
}
