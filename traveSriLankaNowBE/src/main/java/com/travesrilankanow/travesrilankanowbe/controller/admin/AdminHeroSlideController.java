package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.HeroSlide;
import com.travesrilankanow.travesrilankanowbe.service.HeroSlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/hero-slides")
@RequiredArgsConstructor
public class AdminHeroSlideController {

    private final HeroSlideService heroSlideService;

    @GetMapping("/paginated")
    public ResponseEntity<Page<HeroSlide>> getHeroSlidesPaginated(Pageable pageable) {
        return ResponseEntity.ok(heroSlideService.getAllHeroSlidesPaginated(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HeroSlide> getHeroSlideById(@PathVariable Long id) {
        return ResponseEntity.ok(heroSlideService.getHeroSlideById(id));
    }

    @PostMapping
    public ResponseEntity<HeroSlide> createHeroSlide(@RequestBody HeroSlide heroSlide) {
        HeroSlide created = heroSlideService.createHeroSlide(heroSlide);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HeroSlide> updateHeroSlide(@PathVariable Long id, @RequestBody HeroSlide heroSlide) {
        HeroSlide updated = heroSlideService.updateHeroSlide(id, heroSlide);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHeroSlide(@PathVariable Long id) {
        heroSlideService.deleteHeroSlide(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<HeroSlide> toggleActiveStatus(@PathVariable Long id) {
        HeroSlide updated = heroSlideService.toggleActiveStatus(id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/order")
    public ResponseEntity<Void> updateDisplayOrder(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer newOrder = body.get("displayOrder");
        heroSlideService.updateDisplayOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }
}
