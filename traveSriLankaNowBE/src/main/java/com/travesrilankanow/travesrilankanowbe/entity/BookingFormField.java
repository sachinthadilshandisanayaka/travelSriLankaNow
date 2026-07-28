package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "booking_form_fields")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingFormField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "field_key", unique = true, nullable = false, length = 100)
    private String fieldKey;

    @Column(nullable = false, length = 200)
    private String label;

    /** TEXT | TEXTAREA | DROPDOWN | CHECKBOX_GROUP | DATE | NUMBER */
    @Column(name = "field_type", nullable = false, length = 50)
    private String fieldType;

    @Column(length = 200)
    private String placeholder;

    @Column(nullable = false)
    private boolean required = false;

    /** JSON array of strings — used for DROPDOWN and CHECKBOX_GROUP field types. */
    @Column(columnDefinition = "TEXT")
    private String options;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
