package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.HeroSlide;
import com.travesrilankanow.travesrilankanowbe.service.HeroSlideService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/hero-slides")
@RequiredArgsConstructor
public class AdminHeroSlideController {

    private final HeroSlideService heroSlideService;

    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('HERO_SLIDES:VIEW')")
    public ResponseEntity<Page<HeroSlide>> getHeroSlidesPaginated(Pageable pageable) {
        return ResponseEntity.ok(heroSlideService.getAllHeroSlidesPaginated(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('HERO_SLIDES:VIEW')")
    public ResponseEntity<HeroSlide> getHeroSlideById(@PathVariable Long id) {
        return ResponseEntity.ok(heroSlideService.getHeroSlideById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('HERO_SLIDES:CREATE')")
    public ResponseEntity<HeroSlide> createHeroSlide(@RequestBody HeroSlide heroSlide) {
        return ResponseEntity.status(HttpStatus.CREATED).body(heroSlideService.createHeroSlide(heroSlide));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('HERO_SLIDES:UPDATE')")
    public ResponseEntity<HeroSlide> updateHeroSlide(@PathVariable Long id, @RequestBody HeroSlide heroSlide) {
        return ResponseEntity.ok(heroSlideService.updateHeroSlide(id, heroSlide));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('HERO_SLIDES:DELETE')")
    public ResponseEntity<Void> deleteHeroSlide(@PathVariable Long id) {
        heroSlideService.deleteHeroSlide(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('HERO_SLIDES:UPDATE')")
    public ResponseEntity<HeroSlide> toggleActiveStatus(@PathVariable Long id) {
        return ResponseEntity.ok(heroSlideService.toggleActiveStatus(id));
    }

    @PatchMapping("/{id}/order")
    @PreAuthorize("hasAuthority('HERO_SLIDES:UPDATE')")
    public ResponseEntity<Void> updateDisplayOrder(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        heroSlideService.updateDisplayOrder(id, body.get("displayOrder"));
        return ResponseEntity.ok().build();
    }
}
