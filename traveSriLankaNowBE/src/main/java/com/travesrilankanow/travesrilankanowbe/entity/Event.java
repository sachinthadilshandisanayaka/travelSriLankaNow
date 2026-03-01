package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String shortDescription;

    private String imageUrl;

    @Column(nullable = false)
    private String category;

    private String location;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventDate> dates = new ArrayList<>();

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

    @PrePersist
    private void setDefaults() {
        if (displayOrder == null) displayOrder = 0;
        if (featured == null) featured = false;
    }
}
