package com.travesrilankanow.travesrilankanowbe.service.booking;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.repository.EventBookingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PlaceBookableResolver implements BookableEntityResolver {

    private final PlaceRepository placeRepository;
    private final EventBookingRepository bookingRepository;

    @Override
    public String getBookingTypeCode() {
        return EventBooking.BookingTypes.PLACE;
    }

    @Override
    public String getDisplayTypeLabel() {
        return "Place Reservation";
    }

    @Override
    public Long getEntityId(EventBooking booking) {
        return booking.getPlaceId();
    }

    @Override
    public String resolveTitle(Long entityId) {
        if (entityId == null) return "Unknown Place";
        return placeRepository.findById(entityId).map(Place::getName).orElse("Unknown Place");
    }

    @Override
    public long countActiveByDate(Long entityId, LocalDate date, EventBooking.BookingStatus cancelledStatus) {
        return bookingRepository.countActiveByTypeAndPlaceAndDate(getBookingTypeCode(), entityId, date, cancelledStatus);
    }

    @Override
    public List<Object[]> countByDateRange(Long entityId, LocalDate from, LocalDate to, EventBooking.BookingStatus cancelledStatus) {
        return bookingRepository.countByTypeAndPlaceAndDateRange(getBookingTypeCode(), entityId, from, to, cancelledStatus);
    }
}
