package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSection;
import com.travesrilankanow.travesrilankanowbe.entity.MoreSectionItem;
import com.travesrilankanow.travesrilankanowbe.service.MoreSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/more-sections")
@RequiredArgsConstructor
public class AdminMoreSectionController {

    private final MoreSectionService moreSectionService;

    // Section CRUD
    @GetMapping("/paginated")
    public ResponseEntity<Page<MoreSection>> getSectionsPaginated(Pageable pageable) {
        return ResponseEntity.ok(moreSectionService.getAllSectionsPaginated(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MoreSection> getSectionById(@PathVariable Long id) {
        return ResponseEntity.ok(moreSectionService.getSectionById(id));
    }

    @PostMapping
    public ResponseEntity<MoreSection> createSection(@RequestBody MoreSection section) {
        MoreSection created = moreSectionService.createSection(section);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MoreSection> updateSection(@PathVariable Long id, @RequestBody MoreSection section) {
        MoreSection updated = moreSectionService.updateSection(id, section);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        moreSectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<MoreSection> toggleSectionActive(@PathVariable Long id) {
        MoreSection updated = moreSectionService.toggleActiveStatus(id);
        return ResponseEntity.ok(updated);
    }

    // Item CRUD
    @GetMapping("/{sectionId}/items")
    public ResponseEntity<List<MoreSectionItem>> getItemsBySection(@PathVariable Long sectionId) {
        return ResponseEntity.ok(moreSectionService.getItemsBySection(sectionId));
    }

    @GetMapping("/{sectionId}/items/paginated")
    public ResponseEntity<Page<MoreSectionItem>> getItemsBySectionPaginated(@PathVariable Long sectionId, Pageable pageable) {
        return ResponseEntity.ok(moreSectionService.getItemsBySectionPaginated(sectionId, pageable));
    }

    @PostMapping("/{sectionId}/items")
    public ResponseEntity<MoreSectionItem> createItem(@PathVariable Long sectionId, @RequestBody MoreSectionItem item) {
        MoreSectionItem created = moreSectionService.createItem(sectionId, item);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<MoreSectionItem> updateItem(@PathVariable Long itemId, @RequestBody MoreSectionItem item) {
        MoreSectionItem updated = moreSectionService.updateItem(itemId, item);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        moreSectionService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/items/{itemId}/toggle-active")
    public ResponseEntity<MoreSectionItem> toggleItemActive(@PathVariable Long itemId) {
        MoreSectionItem updated = moreSectionService.toggleItemActiveStatus(itemId);
        return ResponseEntity.ok(updated);
    }
}
