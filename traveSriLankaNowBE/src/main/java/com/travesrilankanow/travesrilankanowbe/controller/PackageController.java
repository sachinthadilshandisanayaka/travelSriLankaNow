package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.dto.PackageBookingRequest;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.TourPackage;
import com.travesrilankanow.travesrilankanowbe.service.EventBookingService;
import com.travesrilankanow.travesrilankanowbe.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;
    private final EventBookingService bookingService;

    @GetMapping
    public ResponseEntity<Page<TourPackage>> getAllPackages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        Sort sort = Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("displayOrder"), Sort.Order.desc("id"));
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(packageService.getPackagesPaginatedWithFilter(search, category, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TourPackage> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<TourPackage> getPackageBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(packageService.getPackageBySlug(slug));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<TourPackage>> getFeaturedPackages() {
        return ResponseEntity.ok(packageService.getFeaturedPackages());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<TourPackage>> getPackagesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(packageService.getPackagesByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TourPackage>> searchPackages(@RequestParam String q) {
        return ResponseEntity.ok(packageService.searchPackages(q));
    }

    @PostMapping("/{id}/book")
    public ResponseEntity<EventBooking> bookPackage(
            @PathVariable Long id,
            @RequestBody PackageBookingRequest request,
            Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        EventBooking booking = bookingService.bookPackage(id, request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(booking);
    }
}
