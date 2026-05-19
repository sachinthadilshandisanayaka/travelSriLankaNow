package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bk_availability_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BkAvailabilityConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_type_code", nullable = false, length = 50)
    private String bookingTypeCode;

    /** null means the config applies to all entities of this booking type */
    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "allow_multiple_per_date")
    private boolean allowMultiplePerDate = true;

    @Column(name = "max_bookings_per_date")
    private Integer maxBookingsPerDate;

    @Column(name = "is_active")
    private boolean active = true;
}
