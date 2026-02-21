package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.HeroSlide;
import com.travesrilankanow.travesrilankanowbe.service.HeroSlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hero-slides")
@RequiredArgsConstructor
public class HeroSlideController {

    private final HeroSlideService heroSlideService;

    @GetMapping
    public ResponseEntity<List<HeroSlide>> getActiveHeroSlides() {
        return ResponseEntity.ok(heroSlideService.getActiveHeroSlides());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HeroSlide> getHeroSlideById(@PathVariable Long id) {
        return ResponseEntity.ok(heroSlideService.getHeroSlideById(id));
    }
}
