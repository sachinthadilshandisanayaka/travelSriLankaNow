package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column
    private Long eventId;

    @Column
    private Long placeId;

    @Column
    private Long packageId;

    /** FK to bk_types.code — the string column is the writable side of the relationship. */
    @Column(name = "booking_type", nullable = false, length = 50)
    private String bookingType = "EVENT";

    /** Read-only JPA relationship — use bookingType (String) to set/compare the value. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_type", referencedColumnName = "code", insertable = false, updatable = false)
    private BkType bookingTypeRef;

    /** Retained as string constants for readability in service/controller code. */
    public static final class BookingTypes {
        public static final String EVENT = "EVENT";
        public static final String PLACE = "PLACE";
        public static final String PACKAGE = "PACKAGE";
    }

    @Column
    private Long eventDateId;

    @Column(nullable = false)
    private String participantName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private Integer numberOfPeople;

    @Column(columnDefinition = "TEXT")
    private String specialRequests;

    @Column(nullable = false)
    private Double totalPrice;

    /** System timestamp of when the booking record was created (not the customer's chosen visit date). */
    @Column(nullable = false)
    private LocalDateTime bookingDate;

    /** The customer's chosen visit/event date. This is what the calendar should show. */
    @Column(name = "requested_date")
    private LocalDate requestedDate;

    /** Check-in date for RANGE mode bookings (e.g. multi-day tours, accommodation). */
    @Column(name = "check_in_date")
    private LocalDate checkInDate;

    /** Check-out date for RANGE mode bookings. */
    @Column(name = "check_out_date")
    private LocalDate checkOutDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    public enum BookingStatus {
        pending, confirmed, completed, cancelled
    }

    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "booking_reference", unique = true, length = 30)
    private String bookingReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    public enum PaymentStatus {
        UNPAID, PARTIALLY_PAID, PAID, REFUNDED
    }

    // ── Audit fields ──────────────────────────────────────────────────────────

    @Version
    @Column(nullable = false)
    private Long version = 0L;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "terms_accepted")
    private boolean termsAccepted = false;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "edited_at")
    private LocalDateTime editedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdDate = now;
        this.updatedDate = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedDate = LocalDateTime.now();
    }
}
