package com.travesrilankanow.travesrilankanowbe.service.booking;

import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.repository.EventBookingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class EventBookableResolver implements BookableEntityResolver {

    private final EventRepository eventRepository;
    private final EventBookingRepository bookingRepository;

    @Override
    public String getBookingTypeCode() {
        return EventBooking.BookingTypes.EVENT;
    }

    @Override
    public String getDisplayTypeLabel() {
        return "Long Tour";
    }

    @Override
    public Long getEntityId(EventBooking booking) {
        return booking.getEventId();
    }

    @Override
    public String resolveTitle(Long entityId) {
        if (entityId == null) return "Unknown Event";
        return eventRepository.findById(entityId).map(Event::getTitle).orElse("Unknown Event");
    }

    @Override
    public long countActiveByDate(Long entityId, LocalDate date, EventBooking.BookingStatus cancelledStatus) {
        return bookingRepository.countActiveByTypeAndEventAndDate(getBookingTypeCode(), entityId, date, cancelledStatus);
    }

    @Override
    public List<Object[]> countByDateRange(Long entityId, LocalDate from, LocalDate to, EventBooking.BookingStatus cancelledStatus) {
        return bookingRepository.countByTypeAndEventAndDateRange(getBookingTypeCode(), entityId, from, to, cancelledStatus);
    }
}
