package com.travesrilankanow.travesrilankanowbe.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "hero_slide_gallery")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeroSlideGallery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hero_slide_id", nullable = false, unique = true)
    @JsonIgnore
    private HeroSlide heroSlide;

    @Column(nullable = false)
    private boolean enabled = false;

    @OneToMany(mappedBy = "gallery", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @JsonManagedReference
    private List<HeroSlideGalleryItem> items = new ArrayList<>();

    public Long getHeroSlideId() {
        return heroSlide != null ? heroSlide.getId() : null;
    }
}
