package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection;
import com.travesrilankanow.travesrilankanowbe.service.HomepageSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/homepage-sections")
@RequiredArgsConstructor
public class HomepageSectionController {

    private final HomepageSectionService homepageSectionService;

    @GetMapping
    public ResponseEntity<List<HomepageSection>> getActiveSections() {
        return ResponseEntity.ok(homepageSectionService.getActiveSections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HomepageSection> getSectionById(@PathVariable Long id) {
        return ResponseEntity.ok(homepageSectionService.getSectionById(id));
    }
}
