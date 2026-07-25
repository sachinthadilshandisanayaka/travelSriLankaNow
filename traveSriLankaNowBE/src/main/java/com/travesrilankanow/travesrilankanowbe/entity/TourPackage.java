package com.travesrilankanow.travesrilankanowbe.entity;

import com.travesrilankanow.travesrilankanowbe.entity.converter.JsonMapConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "packages", indexes = {
        @Index(name = "idx_packages_featured", columnList = "featured"),
        @Index(name = "idx_packages_category", columnList = "category"),
        @Index(name = "idx_packages_display_order", columnList = "display_order")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TourPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String shortDescription;

    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "package_images", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private String category;

    private String location;

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PackageDate> dates = new ArrayList<>();

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("visitOrder ASC")
    private List<PackageLocation> packageLocations = new ArrayList<>();

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<PackagePricing> pricings = new ArrayList<>();

    @Column(nullable = false)
    private Double price;

    private String duration;

    @Column(nullable = false)
    private Integer maxParticipants;

    @Column(nullable = false)
    private Integer availableSpots;

    @ElementCollection
    @CollectionTable(name = "package_included", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "included_item")
    private List<String> included = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "package_requirements", joinColumns = @JoinColumn(name = "package_id"))
    @Column(name = "requirement")
    private List<String> requirements = new ArrayList<>();

    private Double rating;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonMapConverter.class)
    private Map<String, Object> additionalDetails = new HashMap<>();

    @PrePersist
    private void setDefaults() {
        if (displayOrder == null) displayOrder = 0;
        if (featured == null) featured = false;
    }
}
