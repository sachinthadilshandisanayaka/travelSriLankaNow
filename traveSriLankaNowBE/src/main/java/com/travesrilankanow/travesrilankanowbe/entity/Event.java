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
@Table(name = "events", indexes = {
        @Index(name = "idx_events_featured", columnList = "featured"),
        @Index(name = "idx_events_category", columnList = "category"),
        @Index(name = "idx_events_display_order", columnList = "display_order")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

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
    @CollectionTable(name = "event_images", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @Column(nullable = false)
    private String category;

    private String location;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventDate> dates = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("visitOrder ASC")
    private List<EventLocation> eventLocations = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<EventPricing> pricings = new ArrayList<>();

    @Column(nullable = false)
    private Double price;

    private String duration;

    @Column(nullable = false)
    private Integer maxParticipants;

    @Column(nullable = false)
    private Integer availableSpots;

    @ElementCollection
    @CollectionTable(name = "event_included", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "included_item")
    private List<String> included = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "event_requirements", joinColumns = @JoinColumn(name = "event_id"))
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
