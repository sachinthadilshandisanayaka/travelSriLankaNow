package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.dto.BookingAdminResponse;
import com.travesrilankanow.travesrilankanowbe.dto.BookingCalendarDay;
import com.travesrilankanow.travesrilankanowbe.dto.EventBookingDTO;
import com.travesrilankanow.travesrilankanowbe.entity.BkAuditLog;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.service.BookingAuditService;
import com.travesrilankanow.travesrilankanowbe.service.EventBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final EventBookingService bookingService;
    private final BookingAuditService auditService;

    // ── Customer-facing ───────────────────────────────────────────────────────
    // Cancel / edit / condition-check live in CustomerController (/api/customer/bookings/...)
    // which requires authentication and verifies booking ownership.

    @PostMapping("/events/book")
    public ResponseEntity<EventBooking> bookEvent(
            @Valid @RequestBody EventBookingDTO bookingDTO,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bookingService.bookEvent(bookingDTO, username));
    }

    /** Public endpoint — returns fully-booked and blacked-out dates for a given month. */
    @GetMapping("/availability/blocked-dates")
    public ResponseEntity<List<String>> getBlockedDates(
            @RequestParam String bookingType,
            @RequestParam(required = false) Long entityId,
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam(required = false) String routePath) {
        return ResponseEntity.ok(bookingService.getBlockedDates(bookingType, entityId, year, month, routePath));
    }

    // ── Admin-protected ───────────────────────────────────────────────────────

    @GetMapping("/admin/bookings")
    @PreAuthorize("hasAuthority('BOOKINGS:VIEW')")
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
                dateFrom, dateTo,
                pageable));
    }

    @GetMapping("/admin/bookings/{id}")
    @PreAuthorize("hasAuthority('BOOKINGS:VIEW')")
    public ResponseEntity<BookingAdminResponse> getAdminBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getAdminBooking(id));
    }

    @PatchMapping("/admin/bookings/{id}/status")
    @PreAuthorize("hasAuthority('BOOKINGS:UPDATE')")
    public ResponseEntity<BookingAdminResponse> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam EventBooking.BookingStatus status,
            Authentication authentication) {
        String changedBy = authentication != null ? authentication.getName() : "admin";
        bookingService.updateBookingStatus(id, status, changedBy);
        return ResponseEntity.ok(bookingService.getAdminBooking(id));
    }

    @GetMapping("/admin/bookings/calendar")
    @PreAuthorize("hasAuthority('BOOKINGS:VIEW')")
    public ResponseEntity<List<BookingCalendarDay>> getBookingCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(bookingService.getBookingCalendar(year, month));
    }

    @GetMapping("/admin/bookings/{id}/audit")
    @PreAuthorize("hasAuthority('BOOKINGS:VIEW')")
    public ResponseEntity<List<BkAuditLog>> getAuditHistory(@PathVariable Long id) {
        return ResponseEntity.ok(auditService.getHistory(id));
    }
}
