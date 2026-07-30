package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.Data;

@Data
public class PackageBookingRequest {
    private String participantName;
    private String email;
    private String phone;
    private Integer numberOfPeople;
    private String specialRequests;
    private Double totalPrice;

    // RANGE mode
    private String checkInDate;
    private String checkOutDate;

    // SINGLE mode
    private Long packageDateId;
    private String preferredDate;

    /** Nav route that initiated the booking (e.g. "/packages"). Used to apply NavBookingConfig rules. */
    private String navRoutePath;
}
