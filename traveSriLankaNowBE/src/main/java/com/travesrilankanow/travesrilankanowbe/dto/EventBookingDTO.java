package com.travesrilankanow.travesrilankanowbe.dto;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventBookingDTO {

    private Long id;

    @NotNull(message = "Event ID is required")
    private Long eventId;

    // Optional – null when event has no specific dates
    private Long eventDateId;

    @NotBlank(message = "Participant name is required")
    private String participantName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotNull(message = "Number of people is required")
    @Min(value = 1, message = "At least 1 person is required")
    private Integer numberOfPeople;

    private String specialRequests;

    /** Customer's chosen visit/event date. Stored as requestedDate on the booking record. */
    private LocalDate requestedDate;

    /** Check-in date for RANGE mode bookings (e.g. multi-day tours). */
    private LocalDate checkInDate;

    /** Check-out date for RANGE mode bookings. */
    private LocalDate checkOutDate;

    /** Legacy free-text field kept for backward compatibility */
    private String preferredDate;

    private Boolean termsAccepted;

    /** Nav route that initiated the booking (e.g. "/events"). Used to apply NavBookingConfig rules. */
    private String navRoutePath;

    @NotNull(message = "Total price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double totalPrice;

    private LocalDateTime bookingDate;

    private EventBooking.BookingStatus status;

    /** Custom field answers: key → value (serialised to JSON before persisting). */
    private java.util.Map<String, Object> customFields;
}
