package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.dto.EventBookingDTO;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.service.EventBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final EventBookingService bookingService;

    @PostMapping("/events/book")
    public ResponseEntity<EventBooking> bookEvent(@Valid @RequestBody EventBookingDTO bookingDTO) {
        EventBooking booking = bookingService.bookEvent(bookingDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<EventBooking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<EventBooking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/bookings/email/{email}")
    public ResponseEntity<List<EventBooking>> getBookingsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(bookingService.getBookingsByEmail(email));
    }

    @GetMapping("/bookings/event/{eventId}")
    public ResponseEntity<List<EventBooking>> getBookingsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(bookingService.getBookingsByEventId(eventId));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<EventBooking> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam EventBooking.BookingStatus status) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }
}
