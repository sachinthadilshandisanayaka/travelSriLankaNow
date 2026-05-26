package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.Location;
import com.travesrilankanow.travesrilankanowbe.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<Page<Location>> getAllLocations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String region) {
        Sort sort = Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("displayOrder"), Sort.Order.desc("id"));
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(locationService.getLocationsPaginatedWithFilter(search, category, region, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Location> getLocationById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getLocationById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Location> getLocationBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(locationService.getLocationBySlug(slug));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Location>> getFeaturedLocations() {
        return ResponseEntity.ok(locationService.getFeaturedLocations());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Location>> getLocationsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(locationService.getLocationsByCategory(category));
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<Location>> getLocationsByRegion(@PathVariable String region) {
        return ResponseEntity.ok(locationService.getLocationsByRegion(region));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Location>> searchLocations(@RequestParam String q) {
        return ResponseEntity.ok(locationService.searchLocations(q));
    }
}
