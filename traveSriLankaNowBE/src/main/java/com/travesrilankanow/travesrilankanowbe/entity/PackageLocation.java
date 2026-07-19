package com.travesrilankanow.travesrilankanowbe.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "package_locations", indexes = {
    @Index(name = "idx_package_locations_package", columnList = "package_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TourPackage pkg;

    @Column(name = "location_ref_id")
    private Long locationRefId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer visitOrder;

    private String durationHere;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (visitOrder == null) visitOrder = 0;
    }
}
