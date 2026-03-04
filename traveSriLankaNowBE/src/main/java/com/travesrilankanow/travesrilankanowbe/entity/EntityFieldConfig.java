package com.travesrilankanow.travesrilankanowbe.entity;

import com.travesrilankanow.travesrilankanowbe.entity.converter.JsonListConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "entity_field_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EntityFieldConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String entityType;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = JsonListConverter.class)
    private List<Map<String, Object>> fieldDefinitions = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
