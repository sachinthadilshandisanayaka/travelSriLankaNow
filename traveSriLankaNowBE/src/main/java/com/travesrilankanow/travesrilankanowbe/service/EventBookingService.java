package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.BookingAdminResponse;
import com.travesrilankanow.travesrilankanowbe.dto.BookingCalendarDay;
import com.travesrilankanow.travesrilankanowbe.dto.EventBookingDTO;
import com.travesrilankanow.travesrilankanowbe.dto.PlaceBookingRequest;
import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.EventDate;
import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.BookingSpecification;
import com.travesrilankanow.travesrilankanowbe.repository.EventBookingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EventDateRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PlaceRepository;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventBookingService {

    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final EventDateRepository eventDateRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;

    @Transactional
    public EventBooking bookEvent(EventBookingDTO bookingDTO, String currentUsername) {
        // Validate event exists
        eventRepository.findById(bookingDTO.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + bookingDTO.getEventId()));

        // Handle optional event date
        if (bookingDTO.getEventDateId() != null) {
            EventDate eventDate = eventDateRepository.findById(bookingDTO.getEventDateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event date not found: " + bookingDTO.getEventDateId()));
            if (eventDate.getAvailableSpots() < bookingDTO.getNumberOfPeople()) {
                throw new IllegalStateException("Not enough spots available for this date");
            }
            eventDate.setAvailableSpots(eventDate.getAvailableSpots() - bookingDTO.getNumberOfPeople());
            eventDateRepository.save(eventDate);
        }

        EventBooking booking = new EventBooking();
        booking.setEventId(bookingDTO.getEventId());
        booking.setEventDateId(bookingDTO.getEventDateId());
        booking.setParticipantName(bookingDTO.getParticipantName());
        booking.setEmail(bookingDTO.getEmail());
        booking.setPhone(bookingDTO.getPhone());
        booking.setNumberOfPeople(bookingDTO.getNumberOfPeople());
        String notes = bookingDTO.getSpecialRequests() != null ? bookingDTO.getSpecialRequests() : "";
        if (bookingDTO.getPreferredDate() != null && !bookingDTO.getPreferredDate().isBlank()) {
            notes = (notes.isBlank() ? "" : notes + "\n") + "Preferred date: " + bookingDTO.getPreferredDate();
        }
        booking.setSpecialRequests(notes.isBlank() ? null : notes);
        booking.setTotalPrice(bookingDTO.getTotalPrice());
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(EventBooking.BookingStatus.pending);
        booking.setPaymentStatus(EventBooking.PaymentStatus.UNPAID);

        // Link authenticated customer if logged in
        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername)
                    .ifPresent(user -> booking.setCustomerId(user.getId()));
        }

        // Save first to get the generated ID, then set reference
        EventBooking saved = bookingRepository.save(booking);
        String ref = "TSL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"))
                + "-" + String.format("%04d", saved.getId());
        saved.setBookingReference(ref);
        return bookingRepository.save(saved);
    }

    @Transactional
    public EventBooking bookPlace(Long placeId, PlaceBookingRequest req, String currentUsername) {
        placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + placeId));

        StringBuilder notes = new StringBuilder();
        if (req.getMessage() != null && !req.getMessage().isBlank()) notes.append(req.getMessage());
        if (req.getCheckInDate() != null && !req.getCheckInDate().isBlank())
            notes.append("\nCheck-in: ").append(req.getCheckInDate());
        if (req.getCheckOutDate() != null && !req.getCheckOutDate().isBlank())
            notes.append("\nCheck-out: ").append(req.getCheckOutDate());
        if (req.getVisitDate() != null && !req.getVisitDate().isBlank())
            notes.append("\nVisit date: ").append(req.getVisitDate());
        if (req.getPreferredTime() != null && !req.getPreferredTime().isBlank())
            notes.append("\nPreferred time: ").append(req.getPreferredTime());

        EventBooking booking = new EventBooking();
        booking.setBookingType(EventBooking.BookingType.PLACE);
        booking.setPlaceId(placeId);
        booking.setParticipantName(req.getVisitorName());
        booking.setEmail(req.getEmail());
        booking.setPhone(req.getPhone() != null ? req.getPhone() : "");
        booking.setNumberOfPeople(req.getPartySize() != null ? req.getPartySize() : 1);
        booking.setSpecialRequests(notes.toString());
        booking.setTotalPrice(0.0);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(EventBooking.BookingStatus.pending);
        booking.setPaymentStatus(EventBooking.PaymentStatus.UNPAID);

        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername)
                    .ifPresent(user -> booking.setCustomerId(user.getId()));
        }

        EventBooking saved = bookingRepository.save(booking);
        String ref = "TSL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"))
                + "-" + String.format("%04d", saved.getId());
        saved.setBookingReference(ref);
        return bookingRepository.save(saved);
    }

    public List<EventBooking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public EventBooking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
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

    // ===== Admin methods =====

    public Page<BookingAdminResponse> getAdminBookings(
            EventBooking.BookingStatus status,
            String search,
            String reference,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            Pageable pageable) {
        boolean hasFilters = status != null
                || (search != null && !search.isBlank())
                || (reference != null && !reference.isBlank())
                || dateFrom != null || dateTo != null;

        Page<EventBooking> page;
        if (hasFilters) {
            var spec = BookingSpecification.withFilters(status, search, reference, dateFrom, dateTo);
            page = bookingRepository.findAll(spec, pageable);
        } else {
            page = bookingRepository.findAllByOrderByBookingDateDesc(pageable);
        }

        List<BookingAdminResponse> content = enrichBookings(page.getContent());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public BookingAdminResponse getAdminBooking(Long id) {
        EventBooking b = getBookingById(id);
        String title = resolveBookingTitle(b);
        return BookingAdminResponse.from(b, title);
    }

    private String resolveBookingTitle(EventBooking b) {
        if (b.getBookingType() == EventBooking.BookingType.PLACE && b.getPlaceId() != null) {
            return placeRepository.findById(b.getPlaceId()).map(Place::getName).orElse("Unknown Place");
        }
        if (b.getEventId() != null) {
            return eventRepository.findById(b.getEventId()).map(Event::getTitle).orElse("Unknown Event");
        }
        return "Unknown";
    }

    public List<BookingCalendarDay> getBookingCalendar(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime from = ym.atDay(1).atStartOfDay();
        LocalDateTime to = ym.atEndOfMonth().atTime(23, 59, 59);

        List<EventBooking> bookings = bookingRepository.findByBookingDateBetween(from, to);
        Map<String, List<EventBooking>> byDate = bookings.stream()
                .collect(Collectors.groupingBy(b -> b.getBookingDate().toLocalDate().toString()));

        // Pre-load event and place titles
        Map<Long, String> eventTitles = bookings.stream()
                .filter(b -> b.getEventId() != null)
                .map(EventBooking::getEventId).distinct()
                .collect(Collectors.toMap(id -> id,
                        id -> eventRepository.findById(id).map(Event::getTitle).orElse("Unknown Event")));
        Map<Long, String> placeTitles = bookings.stream()
                .filter(b -> b.getPlaceId() != null)
                .map(EventBooking::getPlaceId).distinct()
                .collect(Collectors.toMap(id -> id,
                        id -> placeRepository.findById(id).map(Place::getName).orElse("Unknown Place")));

        List<BookingCalendarDay> result = new ArrayList<>();
        for (int d = 1; d <= ym.lengthOfMonth(); d++) {
            LocalDate date = ym.atDay(d);
            List<EventBooking> dayBookings = byDate.getOrDefault(date.toString(), List.of());
            long pending   = dayBookings.stream().filter(b -> b.getStatus() == EventBooking.BookingStatus.pending).count();
            long confirmed = dayBookings.stream().filter(b -> b.getStatus() == EventBooking.BookingStatus.confirmed).count();
            long completed = dayBookings.stream().filter(b -> b.getStatus() == EventBooking.BookingStatus.completed).count();
            List<BookingAdminResponse> enriched = dayBookings.stream()
                    .map(b -> {
                        String title = (b.getBookingType() == EventBooking.BookingType.PLACE)
                                ? placeTitles.getOrDefault(b.getPlaceId(), "Unknown Place")
                                : eventTitles.getOrDefault(b.getEventId(), "Unknown Event");
                        return BookingAdminResponse.from(b, title);
                    })
                    .collect(Collectors.toList());
            result.add(new BookingCalendarDay(date, dayBookings.size(), pending, confirmed, completed, enriched));
        }
        return result;
    }

    private List<BookingAdminResponse> enrichBookings(List<EventBooking> bookings) {
        Map<Long, String> eventTitles = bookings.stream()
                .filter(b -> b.getEventId() != null)
                .map(EventBooking::getEventId).distinct()
                .collect(Collectors.toMap(id -> id,
                        id -> eventRepository.findById(id).map(Event::getTitle).orElse("Unknown Event")));
        Map<Long, String> placeTitles = bookings.stream()
                .filter(b -> b.getPlaceId() != null)
                .map(EventBooking::getPlaceId).distinct()
                .collect(Collectors.toMap(id -> id,
                        id -> placeRepository.findById(id).map(Place::getName).orElse("Unknown Place")));
        return bookings.stream()
                .map(b -> {
                    String title = (b.getBookingType() == EventBooking.BookingType.PLACE)
                            ? placeTitles.getOrDefault(b.getPlaceId(), "Unknown Place")
                            : eventTitles.getOrDefault(b.getEventId(), "Unknown Event");
                    return BookingAdminResponse.from(b, title);
                })
                .collect(Collectors.toList());
    }
}
