package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection;
import com.travesrilankanow.travesrilankanowbe.service.HomepageSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/homepage-sections")
@RequiredArgsConstructor
public class AdminHomepageSectionController {

    private final HomepageSectionService homepageSectionService;

    @GetMapping
    public ResponseEntity<List<HomepageSection>> getAllSections() {
        return ResponseEntity.ok(homepageSectionService.getAllSections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HomepageSection> getSectionById(@PathVariable Long id) {
        return ResponseEntity.ok(homepageSectionService.getSectionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HomepageSection> updateSection(@PathVariable Long id, @RequestBody HomepageSection section) {
        HomepageSection updated = homepageSectionService.updateSection(id, section);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<HomepageSection> toggleActiveStatus(@PathVariable Long id) {
        HomepageSection updated = homepageSectionService.toggleActiveStatus(id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/order")
    public ResponseEntity<Void> updateDisplayOrder(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer newOrder = body.get("displayOrder");
        homepageSectionService.updateDisplayOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorderSections(@RequestBody List<Long> sectionIds) {
        homepageSectionService.reorderSections(sectionIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<HomepageSection> createSection(@RequestBody HomepageSection section) {
        HomepageSection created = homepageSectionService.createSection(section);
        return ResponseEntity.ok(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        homepageSectionService.deleteSection(id);
        return ResponseEntity.noContent().build();
    }
}
