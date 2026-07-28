package com.travesrilankanow.travesrilankanowbe.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class BookingAdminResponse {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private Long id;
    private String bookingReference;
    private String bookingType;
    private Long eventId;
    private String eventTitle;
    private Long placeId;
    private String placeName;
    private Long customerId;
    private String participantName;
    private String email;
    private String phone;
    private Integer numberOfPeople;
    private String specialRequests;
    private Double totalPrice;
    private LocalDateTime bookingDate;
    private LocalDate requestedDate;
    private EventBooking.BookingStatus status;
    private EventBooking.PaymentStatus paymentStatus;
    private boolean termsAccepted;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime editedAt;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private Map<String, Object> customFields;

    public static BookingAdminResponse from(EventBooking b, String displayTitle) {
        BookingAdminResponse r = new BookingAdminResponse();
        r.setId(b.getId());
        r.setBookingReference(b.getBookingReference());
        r.setBookingType(b.getBookingType() != null ? b.getBookingType() : EventBooking.BookingTypes.EVENT);
        r.setEventId(b.getEventId());
        r.setPlaceId(b.getPlaceId());
        if (EventBooking.BookingTypes.PLACE.equals(r.getBookingType())) {
            r.setPlaceName(displayTitle);
            r.setEventTitle(null);
        } else {
            r.setEventTitle(displayTitle);
            r.setPlaceName(null);
        }
        r.setCustomerId(b.getCustomerId());
        r.setParticipantName(b.getParticipantName());
        r.setEmail(b.getEmail());
        r.setPhone(b.getPhone());
        r.setNumberOfPeople(b.getNumberOfPeople());
        r.setSpecialRequests(b.getSpecialRequests());
        r.setTotalPrice(b.getTotalPrice());
        r.setBookingDate(b.getBookingDate());
        r.setRequestedDate(b.getRequestedDate());
        r.setStatus(b.getStatus());
        r.setPaymentStatus(b.getPaymentStatus());
        r.setTermsAccepted(b.isTermsAccepted());
        r.setCancellationReason(b.getCancellationReason());
        r.setCancelledAt(b.getCancelledAt());
        r.setEditedAt(b.getEditedAt());
        r.setCreatedDate(b.getCreatedDate());
        r.setUpdatedDate(b.getUpdatedDate());
        if (b.getCustomFields() != null && !b.getCustomFields().isBlank()) {
            try {
                r.setCustomFields(MAPPER.readValue(b.getCustomFields(), MAPPER.getTypeFactory()
                        .constructMapType(java.util.LinkedHashMap.class, String.class, Object.class)));
            } catch (Exception ignored) {}
        }
        return r;
    }
}
