package com.travesrilankanow.travesrilankanowbe.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.travesrilankanow.travesrilankanowbe.entity.converter.JsonMapConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "more_section_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MoreSectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @JsonIgnore
    private MoreSection section;

    @Column(nullable = false)
    private String title;

    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String imageUrl;

    private String link;

    @Column(nullable = false, columnDefinition = "varchar(20) default 'simple'")
    private String contentType = "simple";

    @Column(columnDefinition = "TEXT")
    private String articleContent;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonMapConverter.class)
    private Map<String, Object> additionalDetails = new HashMap<>();

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (displayOrder == null) displayOrder = 0;
        if (active == null) active = true;
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
