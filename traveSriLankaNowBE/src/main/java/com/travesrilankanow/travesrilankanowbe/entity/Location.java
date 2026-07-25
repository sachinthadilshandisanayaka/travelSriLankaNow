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
@Table(name = "locations", indexes = {
        @Index(name = "idx_locations_featured", columnList = "featured"),
        @Index(name = "idx_locations_category", columnList = "category"),
        @Index(name = "idx_locations_display_order", columnList = "display_order")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String shortDescription;

    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "location_images", joinColumns = @JoinColumn(name = "location_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String region;

    @ElementCollection
    @CollectionTable(name = "location_activities", joinColumns = @JoinColumn(name = "location_id"))
    @Column(name = "activity")
    private List<String> activities = new ArrayList<>();

    private String bestTimeToVisit;

    private Double rating;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    @PrePersist
    private void setDefaults() {
        if (displayOrder == null) displayOrder = 0;
        if (featured == null) featured = false;
    }

    @ElementCollection
    @CollectionTable(name = "location_highlights", joinColumns = @JoinColumn(name = "location_id"))
    @Column(name = "highlight")
    private List<String> highlights = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonMapConverter.class)
    private Map<String, Object> additionalDetails = new HashMap<>();
}
