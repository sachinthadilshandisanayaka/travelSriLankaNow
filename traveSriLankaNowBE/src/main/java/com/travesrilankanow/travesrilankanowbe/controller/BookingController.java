package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.dto.BookingAdminResponse;
import com.travesrilankanow.travesrilankanowbe.dto.BookingCalendarDay;
import com.travesrilankanow.travesrilankanowbe.dto.EventBookingDTO;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.service.EventBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final EventBookingService bookingService;

    // ---- Customer-facing ----

    @PostMapping("/events/book")
    public ResponseEntity<EventBooking> bookEvent(
            @Valid @RequestBody EventBookingDTO bookingDTO,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        EventBooking booking = bookingService.bookEvent(bookingDTO, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    // ---- Admin-protected ----

    @GetMapping("/admin/bookings")
    public ResponseEntity<Page<BookingAdminResponse>> getAdminBookings(
            @RequestParam(required = false) EventBooking.BookingStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String reference,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(bookingService.getAdminBookings(
                status, search, reference,
                dateFrom != null ? dateFrom.atStartOfDay() : null,
                dateTo != null ? dateTo.atTime(23, 59, 59) : null,
                pageable));
    }

    @GetMapping("/admin/bookings/{id}")
    public ResponseEntity<BookingAdminResponse> getAdminBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getAdminBooking(id));
    }

    @PatchMapping("/admin/bookings/{id}/status")
    public ResponseEntity<BookingAdminResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam EventBooking.BookingStatus status) {
        bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(bookingService.getAdminBooking(id));
    }

    @GetMapping("/admin/bookings/calendar")
    public ResponseEntity<List<BookingCalendarDay>> getBookingCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(bookingService.getBookingCalendar(year, month));
    }
}
