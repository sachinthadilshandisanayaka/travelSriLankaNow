package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.entity.PlaceInquiry;
import com.travesrilankanow.travesrilankanowbe.repository.PlaceInquiryRepository;
import com.travesrilankanow.travesrilankanowbe.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;
    private final PlaceInquiryRepository inquiryRepository;

    @GetMapping
    public ResponseEntity<Page<Place>> getAllPlaces(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priceRange) {
        Sort sort = Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("displayOrder"), Sort.Order.desc("id"));
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(placeService.getPlacesPaginatedWithFilter(search, type, priceRange, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Place> getPlaceById(@PathVariable Long id) {
        return ResponseEntity.ok(placeService.getPlaceById(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Place>> getFeaturedPlaces() {
        return ResponseEntity.ok(placeService.getFeaturedPlaces());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Place>> getPlacesByType(@PathVariable String type) {
        return ResponseEntity.ok(placeService.getPlacesByType(type));
    }

    @GetMapping("/region/{region}")
    public ResponseEntity<List<Place>> getPlacesByRegion(@PathVariable String region) {
        return ResponseEntity.ok(placeService.getPlacesByRegion(region));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Place>> searchPlaces(@RequestParam String q) {
        return ResponseEntity.ok(placeService.searchPlaces(q));
    }

    @PostMapping("/{id}/inquiry")
    public ResponseEntity<PlaceInquiry> submitInquiry(
            @PathVariable Long id,
            @RequestBody PlaceInquiry inquiry) {
        inquiry.setPlaceId(id);
        inquiry.setInquiryDate(LocalDateTime.now());
        inquiry.setStatus(PlaceInquiry.InquiryStatus.NEW);
        return ResponseEntity.status(HttpStatus.CREATED).body(inquiryRepository.save(inquiry));
    }
}
