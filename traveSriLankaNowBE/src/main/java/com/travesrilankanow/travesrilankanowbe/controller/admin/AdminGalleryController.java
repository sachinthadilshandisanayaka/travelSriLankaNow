package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.GalleryItem;
import com.travesrilankanow.travesrilankanowbe.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/gallery")
@RequiredArgsConstructor
public class AdminGalleryController {

    private final GalleryService galleryService;

    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('GALLERY:VIEW')")
    public ResponseEntity<Page<GalleryItem>> getGalleryItemsPaginated(Pageable pageable) {
        return ResponseEntity.ok(galleryService.getGalleryItemsPaginated(pageable));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('GALLERY:CREATE')")
    public ResponseEntity<GalleryItem> createGalleryItem(@RequestBody GalleryItem galleryItem) {
        return ResponseEntity.status(HttpStatus.CREATED).body(galleryService.createGalleryItem(galleryItem));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('GALLERY:UPDATE')")
    public ResponseEntity<GalleryItem> updateGalleryItem(@PathVariable Long id, @RequestBody GalleryItem galleryItem) {
        galleryItem.setId(id);
        return ResponseEntity.ok(galleryService.updateGalleryItem(galleryItem));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('GALLERY:DELETE')")
    public ResponseEntity<Void> deleteGalleryItem(@PathVariable Long id) {
        galleryService.deleteGalleryItem(id);
        return ResponseEntity.noContent().build();
    }
}
