package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.SocialMediaContent;
import com.travesrilankanow.travesrilankanowbe.service.SocialMediaContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/social-media-content")
@RequiredArgsConstructor
public class AdminSocialMediaContentController {

    private final SocialMediaContentService socialMediaContentService;

    @GetMapping("/paginated")
    public ResponseEntity<Page<SocialMediaContent>> getSocialMediaContentPaginated(Pageable pageable) {
        return ResponseEntity.ok(socialMediaContentService.getAllSocialMediaContentPaginated(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SocialMediaContent> getSocialMediaContentById(@PathVariable Long id) {
        return ResponseEntity.ok(socialMediaContentService.getSocialMediaContentById(id));
    }

    @PostMapping
    public ResponseEntity<SocialMediaContent> createSocialMediaContent(@RequestBody SocialMediaContent content) {
        SocialMediaContent created = socialMediaContentService.createSocialMediaContent(content);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SocialMediaContent> updateSocialMediaContent(@PathVariable Long id, @RequestBody SocialMediaContent content) {
        SocialMediaContent updated = socialMediaContentService.updateSocialMediaContent(id, content);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSocialMediaContent(@PathVariable Long id) {
        socialMediaContentService.deleteSocialMediaContent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<SocialMediaContent> toggleActiveStatus(@PathVariable Long id) {
        SocialMediaContent updated = socialMediaContentService.toggleActiveStatus(id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/order")
    public ResponseEntity<Void> updateDisplayOrder(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer newOrder = body.get("displayOrder");
        socialMediaContentService.updateDisplayOrder(id, newOrder);
        return ResponseEntity.ok().build();
    }
}
