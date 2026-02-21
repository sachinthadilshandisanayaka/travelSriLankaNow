package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSection;
import com.travesrilankanow.travesrilankanowbe.service.MoreSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/more-sections")
@RequiredArgsConstructor
public class MoreSectionController {

    private final MoreSectionService moreSectionService;

    @GetMapping
    public ResponseEntity<List<MoreSection>> getActiveSections() {
        return ResponseEntity.ok(moreSectionService.getActiveSections());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<MoreSection> getSectionBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(moreSectionService.getSectionBySlug(slug));
    }
}
