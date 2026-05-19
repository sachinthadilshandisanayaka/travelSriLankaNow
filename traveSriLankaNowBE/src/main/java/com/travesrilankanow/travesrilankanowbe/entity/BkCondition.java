package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bk_conditions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BkCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_type_code", nullable = false, length = 50)
    private String bookingTypeCode;

    /**
     * Supported types:
     * CANCEL_WITHIN_DAYS       – customer can cancel within N days of booking creation
     * CANCEL_BEFORE_EVENT_DAYS – customer must cancel at least N days before requestedDate
     * EDIT_WITHIN_DAYS         – customer can edit within N days of booking creation
     * EDIT_BEFORE_EVENT_DAYS   – customer must edit at least N days before requestedDate
     */
    @Column(name = "condition_type", nullable = false, length = 100)
    private String conditionType;

    @Column(name = "condition_value", nullable = false)
    private String conditionValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private boolean active = true;
}
