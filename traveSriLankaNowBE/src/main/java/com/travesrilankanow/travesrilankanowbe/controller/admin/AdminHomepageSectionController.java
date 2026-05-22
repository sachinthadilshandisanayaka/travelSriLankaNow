package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection;
import com.travesrilankanow.travesrilankanowbe.service.HomepageSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/homepage-sections")
@RequiredArgsConstructor
public class AdminHomepageSectionController {

    private final HomepageSectionService homepageSectionService;

    @GetMapping
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:VIEW')")
    public ResponseEntity<List<HomepageSection>> getAllSections() {
        return ResponseEntity.ok(homepageSectionService.getAllSections());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:VIEW')")
    public ResponseEntity<HomepageSection> getSectionById(@PathVariable Long id) {
        return ResponseEntity.ok(homepageSectionService.getSectionById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:CREATE')")
    public ResponseEntity<HomepageSection> createSection(@RequestBody HomepageSection section) {
        return ResponseEntity.ok(homepageSectionService.createSection(section));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:UPDATE')")
    public ResponseEntity<HomepageSection> updateSection(@PathVariable Long id, @RequestBody HomepageSection section) {
        return ResponseEntity.ok(homepageSectionService.updateSection(id, section));
    }

    @PutMapping("/reorder")
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:UPDATE')")
    public ResponseEntity<Void> reorderSections(@RequestBody List<Long> sectionIds) {
        homepageSectionService.reorderSections(sectionIds);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:UPDATE')")
    public ResponseEntity<HomepageSection> toggleActiveStatus(@PathVariable Long id) {
        return ResponseEntity.ok(homepageSectionService.toggleActiveStatus(id));
    }

    @PatchMapping("/{id}/order")
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:UPDATE')")
    public ResponseEntity<Void> updateDisplayOrder(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        homepageSectionService.updateDisplayOrder(id, body.get("displayOrder"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HOMEPAGE_SECTIONS:DELETE')")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        homepageSectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
}
