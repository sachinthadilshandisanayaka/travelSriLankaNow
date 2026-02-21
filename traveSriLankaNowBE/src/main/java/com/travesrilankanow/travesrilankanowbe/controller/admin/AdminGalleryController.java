package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.GalleryItem;
import com.travesrilankanow.travesrilankanowbe.service.GalleryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/gallery")
@RequiredArgsConstructor
public class AdminGalleryController {

    private final GalleryService galleryService;

    @GetMapping("/paginated")
    public ResponseEntity<Page<GalleryItem>> getGalleryItemsPaginated(Pageable pageable) {
        return ResponseEntity.ok(galleryService.getGalleryItemsPaginated(pageable));
    }

    @PostMapping
    public ResponseEntity<GalleryItem> createGalleryItem(@RequestBody GalleryItem galleryItem) {
        GalleryItem created = galleryService.createGalleryItem(galleryItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryItem> updateGalleryItem(@PathVariable Long id, @RequestBody GalleryItem galleryItem) {
        galleryItem.setId(id);
        GalleryItem updated = galleryService.updateGalleryItem(galleryItem);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGalleryItem(@PathVariable Long id) {
        galleryService.deleteGalleryItem(id);
        return ResponseEntity.noContent().build();
    }
}
