package com.travesrilankanow.travesrilankanowbe.dto;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    // Free-form preferred date when event has no specific dates defined
    private String preferredDate;

    @NotNull(message = "Total price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Double totalPrice;

    private LocalDateTime bookingDate;

    private EventBooking.BookingStatus status;
}
