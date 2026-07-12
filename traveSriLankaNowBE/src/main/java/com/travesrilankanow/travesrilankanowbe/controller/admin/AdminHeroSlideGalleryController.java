package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.content.ContentProviderRegistry;
import com.travesrilankanow.travesrilankanowbe.content.ContentTypeInfo;
import com.travesrilankanow.travesrilankanowbe.dto.GalleryUpdateRequest;
import com.travesrilankanow.travesrilankanowbe.entity.HeroSlideGallery;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.service.HeroSlideGalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminHeroSlideGalleryController {

    private final HeroSlideGalleryService galleryService;
    private final ContentProviderRegistry contentProviderRegistry;

    /** Lists all available content types (auto-discovered via ContentProviderRegistry). */
    @GetMapping("/content-types")
    @PreAuthorize("hasAuthority('HERO_SLIDES:UPDATE')")
    public ResponseEntity<List<ContentTypeInfo>> getContentTypes() {
        return ResponseEntity.ok(contentProviderRegistry.getContentTypes());
    }

    /** Returns paginated items for the given content type, with optional search. */
    @GetMapping("/content-types/{type}/items")
    @PreAuthorize("hasAuthority('HERO_SLIDES:UPDATE')")
    public ResponseEntity<Map<String, Object>> getContentTypeItems(
            @PathVariable String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "24") int size,
            @RequestParam(required = false) String search) {
        var provider = contentProviderRegistry.findByType(type)
                .orElseThrow(() -> new ResourceNotFoundException("Content type not found: " + type));
        var result = provider.getItems(search, page, size);
        return ResponseEntity.ok(Map.of(
                "content", result.getContent(),
                "totalElements", result.getTotalElements(),
                "totalPages", result.getTotalPages(),
                "page", result.getNumber()
        ));
    }

    /** Returns current gallery config for a slide (unsaved default if none exists yet). */
    @GetMapping("/hero-slides/{slideId}/gallery")
    @PreAuthorize("hasAuthority('HERO_SLIDES:VIEW')")
    public ResponseEntity<HeroSlideGallery> getGallery(@PathVariable Long slideId) {
        return ResponseEntity.ok(galleryService.getGalleryForSlide(slideId));
    }

    /** Saves gallery config (enabled flag + ordered item list) for a slide. */
    @PutMapping("/hero-slides/{slideId}/gallery")
    @PreAuthorize("hasAuthority('HERO_SLIDES:UPDATE')")
    public ResponseEntity<HeroSlideGallery> saveGallery(
            @PathVariable Long slideId,
            @RequestBody GalleryUpdateRequest request) {
        return ResponseEntity.ok(galleryService.saveGallery(slideId, request));
    }
}
