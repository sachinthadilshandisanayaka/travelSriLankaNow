package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.EventBookingDTO;
import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.EventDate;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.EventBookingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EventDateRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventBookingService {

    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final EventDateRepository eventDateRepository;

    @Transactional
    public EventBooking bookEvent(EventBookingDTO bookingDTO) {
        Event event = eventRepository.findById(bookingDTO.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + bookingDTO.getEventId()));

        EventDate eventDate = eventDateRepository.findById(bookingDTO.getEventDateId())
                .orElseThrow(() -> new ResourceNotFoundException("Event date not found with id: " + bookingDTO.getEventDateId()));

        if (eventDate.getAvailableSpots() < bookingDTO.getNumberOfPeople()) {
            throw new IllegalStateException("Not enough available spots for this event date");
        }

        EventBooking booking = new EventBooking();
        booking.setEventId(bookingDTO.getEventId());
        booking.setEventDateId(bookingDTO.getEventDateId());
        booking.setParticipantName(bookingDTO.getParticipantName());
        booking.setEmail(bookingDTO.getEmail());
        booking.setPhone(bookingDTO.getPhone());
        booking.setNumberOfPeople(bookingDTO.getNumberOfPeople());
        booking.setSpecialRequests(bookingDTO.getSpecialRequests());
        booking.setTotalPrice(bookingDTO.getTotalPrice());
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(EventBooking.BookingStatus.pending);

        eventDate.setAvailableSpots(eventDate.getAvailableSpots() - bookingDTO.getNumberOfPeople());
        eventDateRepository.save(eventDate);

        return bookingRepository.save(booking);
    }

    public List<EventBooking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public EventBooking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public List<EventBooking> getBookingsByEmail(String email) {
        return bookingRepository.findByEmail(email);
    }

    public List<EventBooking> getBookingsByEventId(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }

    @Transactional
    public EventBooking updateBookingStatus(Long id, EventBooking.BookingStatus status) {
        EventBooking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
