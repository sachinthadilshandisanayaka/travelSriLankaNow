package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSection;
import com.travesrilankanow.travesrilankanowbe.entity.MoreSectionItem;
import com.travesrilankanow.travesrilankanowbe.service.MoreSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/more-sections")
@RequiredArgsConstructor
public class AdminMoreSectionController {

    private final MoreSectionService moreSectionService;

    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:VIEW')")
    public ResponseEntity<Page<MoreSection>> getSectionsPaginated(Pageable pageable) {
        return ResponseEntity.ok(moreSectionService.getAllSectionsPaginated(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:VIEW')")
    public ResponseEntity<MoreSection> getSectionById(@PathVariable Long id) {
        return ResponseEntity.ok(moreSectionService.getSectionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MORE_SECTIONS:CREATE')")
    public ResponseEntity<MoreSection> createSection(@RequestBody MoreSection section) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moreSectionService.createSection(section));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:UPDATE')")
    public ResponseEntity<MoreSection> updateSection(@PathVariable Long id, @RequestBody MoreSection section) {
        return ResponseEntity.ok(moreSectionService.updateSection(id, section));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:DELETE')")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        moreSectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:UPDATE')")
    public ResponseEntity<MoreSection> toggleSectionActive(@PathVariable Long id) {
        return ResponseEntity.ok(moreSectionService.toggleActiveStatus(id));
    }

    @GetMapping("/{sectionId}/items")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:VIEW')")
    public ResponseEntity<List<MoreSectionItem>> getItemsBySection(@PathVariable Long sectionId) {
        return ResponseEntity.ok(moreSectionService.getItemsBySection(sectionId));
    }

    @GetMapping("/{sectionId}/items/paginated")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:VIEW')")
    public ResponseEntity<Page<MoreSectionItem>> getItemsBySectionPaginated(
            @PathVariable Long sectionId, Pageable pageable,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String contentType) {
        return ResponseEntity.ok(moreSectionService.getItemsBySectionSearch(sectionId, search, active, contentType, pageable));
    }

    @PostMapping("/{sectionId}/items")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:CREATE')")
    public ResponseEntity<MoreSectionItem> createItem(@PathVariable Long sectionId, @RequestBody MoreSectionItem item) {
        return ResponseEntity.status(HttpStatus.CREATED).body(moreSectionService.createItem(sectionId, item));
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:UPDATE')")
    public ResponseEntity<MoreSectionItem> updateItem(@PathVariable Long itemId, @RequestBody MoreSectionItem item) {
        return ResponseEntity.ok(moreSectionService.updateItem(itemId, item));
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:DELETE')")
    public ResponseEntity<Void> deleteItem(@PathVariable Long itemId) {
        moreSectionService.deleteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/items/{itemId}/toggle-active")
    @PreAuthorize("hasAuthority('MORE_SECTIONS:UPDATE')")
    public ResponseEntity<MoreSectionItem> toggleItemActive(@PathVariable Long itemId) {
        return ResponseEntity.ok(moreSectionService.toggleItemActiveStatus(itemId));
    }
}
