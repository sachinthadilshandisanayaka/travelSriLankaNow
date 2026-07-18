package com.travesrilankanow.travesrilankanowbe.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * A static date on which no bookings are accepted for a specific
 * NavBookingConfig rule (e.g. public holidays, site maintenance).
 */
@Entity
@Table(
    name = "bk_blackout_dates",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_blackout_config_date",
        columnNames = {"nav_booking_config_id", "blackout_date"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BkBlackoutDate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nav_booking_config_id", nullable = false)
    private Long navBookingConfigId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nav_booking_config_id", insertable = false, updatable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private NavBookingConfig navBookingConfig;

    @Column(name = "blackout_date", nullable = false)
    private LocalDate blackoutDate;

    @Column(name = "reason", length = 255)
    private String reason;
}
