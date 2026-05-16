package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false)
    private BookingType bookingType = BookingType.EVENT;

    public enum BookingType { EVENT, PLACE }

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

    @Column(nullable = false)
    private LocalDateTime bookingDate;

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
}
