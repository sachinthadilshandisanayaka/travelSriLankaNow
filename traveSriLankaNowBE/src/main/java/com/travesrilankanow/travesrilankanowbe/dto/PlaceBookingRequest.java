package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.Data;

@Data
public class PlaceBookingRequest {
    private String visitorName;
    private String email;
    private String phone;
    private String checkInDate;
    private String checkOutDate;
    private String visitDate;
    private String preferredTime;
    private Integer partySize;
    private String message;

    /** Nav route that initiated the booking (e.g. "/places"). Used to apply NavBookingConfig rules. */
    private String navRoutePath;
}
