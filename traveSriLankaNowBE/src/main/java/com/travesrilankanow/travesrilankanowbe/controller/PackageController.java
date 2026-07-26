package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.TourPackage;
import com.travesrilankanow.travesrilankanowbe.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
public class PackageController {

    private final PackageService packageService;

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
}
