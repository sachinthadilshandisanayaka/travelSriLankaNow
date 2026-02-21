package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.GalleryItem;
import com.travesrilankanow.travesrilankanowbe.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping
    public ResponseEntity<Page<GalleryItem>> getAllGalleryItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String type) {
        Sort sort = Sort.by(Sort.Order.desc("featured"), Sort.Order.asc("displayOrder"), Sort.Order.desc("id"));
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(galleryService.getGalleryItemsPaginatedWithFilter(search, category, type, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GalleryItem> getGalleryItemById(@PathVariable Long id) {
        return ResponseEntity.ok(galleryService.getGalleryItemById(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<GalleryItem>> getFeaturedGalleryItems() {
        return ResponseEntity.ok(galleryService.getFeaturedGalleryItems());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<GalleryItem>> getGalleryItemsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(galleryService.getGalleryItemsByCategory(category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<GalleryItem>> searchGalleryItems(@RequestParam String q) {
        return ResponseEntity.ok(galleryService.searchGalleryItems(q));
    }
}
