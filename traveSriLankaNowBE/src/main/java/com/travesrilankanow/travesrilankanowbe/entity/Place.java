package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String shortDescription;

    private String imageUrl;

    @ElementCollection
    @CollectionTable(name = "place_images", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    private String location;

    @Column(nullable = false)
    private String region;

    private Double rating;

    private String priceRange;

    @ElementCollection
    @CollectionTable(name = "place_cuisine", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "cuisine")
    private List<String> cuisine = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "place_amenities", joinColumns = @JoinColumn(name = "place_id"))
    @Column(name = "amenity")
    private List<String> amenities = new ArrayList<>();

    @Embedded
    private Contact contact;

    private String address;

    @Embedded
    private Coordinates coordinates;

    private String openingHours;

    @Column(nullable = false)
    private Boolean featured = false;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    @PrePersist
    private void setDefaults() {
        if (displayOrder == null) displayOrder = 0;
        if (featured == null) featured = false;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Contact {
        private String phone;
        private String email;
        private String website;
    }

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coordinates {
        private Double lat;
        private Double lng;
    }
}
