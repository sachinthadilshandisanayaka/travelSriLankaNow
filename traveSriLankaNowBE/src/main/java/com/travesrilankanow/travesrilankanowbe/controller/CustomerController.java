package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.dto.BookingAdminResponse;
import com.travesrilankanow.travesrilankanowbe.dto.BookingCancelRequest;
import com.travesrilankanow.travesrilankanowbe.dto.BookingConditionCheckResponse;
import com.travesrilankanow.travesrilankanowbe.dto.BookingEditRequest;
import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.EventBookingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PlaceRepository;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import com.travesrilankanow.travesrilankanowbe.service.EventBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final UserRepository userRepository;
    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final PlaceRepository placeRepository;
    private final EventBookingService bookingService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                "profileImageUrl", user.getProfileImageUrl() != null ? user.getProfileImageUrl() : "",
                "role", user.getRole().name()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> updates) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (updates.containsKey("firstName")) user.setFirstName(updates.get("firstName"));
        if (updates.containsKey("lastName")) user.setLastName(updates.get("lastName"));
        if (updates.containsKey("phoneNumber")) user.setPhoneNumber(updates.get("phoneNumber"));
        if (updates.containsKey("profileImageUrl")) user.setProfileImageUrl(updates.get("profileImageUrl"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingAdminResponse>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        List<EventBooking> bookings = bookingRepository.findByCustomerIdOrderByBookingDateDesc(user.getId());
        List<BookingAdminResponse> result = bookings.stream()
                .map(b -> BookingAdminResponse.from(b, resolveTitle(b)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingAdminResponse> getMyBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        EventBooking booking = bookingService.getBookingById(id);
        assertOwnership(booking, user);
        return ResponseEntity.ok(BookingAdminResponse.from(booking, resolveTitle(booking)));
    }

    @GetMapping("/bookings/{id}/conditions")
    public ResponseEntity<BookingConditionCheckResponse> checkConditions(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        EventBooking booking = bookingService.getBookingById(id);
        assertOwnership(booking, user);
        return ResponseEntity.ok(bookingService.checkConditions(id));
    }

    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<BookingAdminResponse> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingCancelRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        EventBooking booking = bookingService.getBookingById(id);
        assertOwnership(booking, user);
        String reason = req != null ? req.getReason() : null;
        bookingService.cancelBooking(id, reason, user.getUsername());
        return ResponseEntity.ok(bookingService.getAdminBooking(id));
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<BookingAdminResponse> editBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingEditRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = resolveUser(userDetails);
        EventBooking booking = bookingService.getBookingById(id);
        assertOwnership(booking, user);
        bookingService.editBooking(id, req, user.getUsername());
        return ResponseEntity.ok(bookingService.getAdminBooking(id));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleConditionViolation(IllegalStateException ex) {
        return ResponseEntity.status(422).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "You do not have permission to access this booking"));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void assertOwnership(EventBooking booking, User user) {
        if (!user.getId().equals(booking.getCustomerId())) {
            throw new AccessDeniedException("Booking does not belong to this user");
        }
    }

    private String resolveTitle(EventBooking b) {
        if (EventBooking.BookingTypes.PLACE.equals(b.getBookingType()) && b.getPlaceId() != null) {
            return placeRepository.findById(b.getPlaceId()).map(Place::getName).orElse("Unknown Place");
        }
        if (b.getEventId() != null) {
            return eventRepository.findById(b.getEventId()).map(Event::getTitle).orElse("Unknown Event");
        }
        return "Unknown";
    }
}
