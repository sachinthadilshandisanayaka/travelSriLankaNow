package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.dto.BookingAdminResponse;
import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.repository.EventBookingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PlaceRepository;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<BookingAdminResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<EventBooking> bookings = bookingRepository.findByCustomerIdOrderByBookingDateDesc(user.getId());
        List<BookingAdminResponse> result = bookings.stream().map(b -> {
            String title;
            if (b.getBookingType() == EventBooking.BookingType.PLACE && b.getPlaceId() != null) {
                title = placeRepository.findById(b.getPlaceId()).map(Place::getName).orElse("Unknown Place");
            } else if (b.getEventId() != null) {
                title = eventRepository.findById(b.getEventId()).map(Event::getTitle).orElse("Unknown Event");
            } else {
                title = "Unknown";
            }
            return BookingAdminResponse.from(b, title);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
