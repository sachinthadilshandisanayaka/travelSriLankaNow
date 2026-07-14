package com.travesrilankanow.travesrilankanowbe.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hero_slide_gallery_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeroSlideGalleryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id", nullable = false)
    @JsonBackReference
    private HeroSlideGallery gallery;

    @Column(name = "content_type", nullable = false, length = 50)
    private String contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "image_url", nullable = false, length = 1024)
    private String imageUrl;

    @Column(name = "label", length = 255)
    private String label;

    @Column(name = "link", length = 512)
    private String link;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;
}
