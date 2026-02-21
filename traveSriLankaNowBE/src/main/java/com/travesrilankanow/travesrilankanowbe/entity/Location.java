package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

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

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @ElementCollection
    @CollectionTable(name = "location_highlights", joinColumns = @JoinColumn(name = "location_id"))
    @Column(name = "highlight")
    private List<String> highlights = new ArrayList<>();
}
