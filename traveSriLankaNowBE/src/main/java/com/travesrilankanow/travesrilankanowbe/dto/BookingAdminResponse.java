package com.travesrilankanow.travesrilankanowbe.dto;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingAdminResponse {

    private Long id;
    private String bookingReference;
    private Long eventId;
    private String eventTitle;
    private Long customerId;
    private String participantName;
    private String email;
    private String phone;
    private Integer numberOfPeople;
    private String specialRequests;
    private Double totalPrice;
    private LocalDateTime bookingDate;
    private EventBooking.BookingStatus status;
    private EventBooking.PaymentStatus paymentStatus;

    public static BookingAdminResponse from(EventBooking b, String eventTitle) {
        BookingAdminResponse r = new BookingAdminResponse();
        r.setId(b.getId());
        r.setBookingReference(b.getBookingReference());
        r.setEventId(b.getEventId());
        r.setEventTitle(eventTitle);
        r.setCustomerId(b.getCustomerId());
        r.setParticipantName(b.getParticipantName());
        r.setEmail(b.getEmail());
        r.setPhone(b.getPhone());
        r.setNumberOfPeople(b.getNumberOfPeople());
        r.setSpecialRequests(b.getSpecialRequests());
        r.setTotalPrice(b.getTotalPrice());
        r.setBookingDate(b.getBookingDate());
        r.setStatus(b.getStatus());
        r.setPaymentStatus(b.getPaymentStatus());
        return r;
    }
}
