package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.SocialMediaContent;
import com.travesrilankanow.travesrilankanowbe.service.SocialMediaContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/social-media-content")
@RequiredArgsConstructor
public class AdminSocialMediaContentController {

    private final SocialMediaContentService socialMediaContentService;

    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('SOCIAL_MEDIA:VIEW')")
    public ResponseEntity<Page<SocialMediaContent>> getSocialMediaContentPaginated(Pageable pageable) {
        return ResponseEntity.ok(socialMediaContentService.getAllSocialMediaContentPaginated(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SOCIAL_MEDIA:VIEW')")
    public ResponseEntity<SocialMediaContent> getSocialMediaContentById(@PathVariable Long id) {
        return ResponseEntity.ok(socialMediaContentService.getSocialMediaContentById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SOCIAL_MEDIA:CREATE')")
    public ResponseEntity<SocialMediaContent> createSocialMediaContent(@RequestBody SocialMediaContent content) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialMediaContentService.createSocialMediaContent(content));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SOCIAL_MEDIA:UPDATE')")
    public ResponseEntity<SocialMediaContent> updateSocialMediaContent(@PathVariable Long id, @RequestBody SocialMediaContent content) {
        return ResponseEntity.ok(socialMediaContentService.updateSocialMediaContent(id, content));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SOCIAL_MEDIA:DELETE')")
    public ResponseEntity<Void> deleteSocialMediaContent(@PathVariable Long id) {
        socialMediaContentService.deleteSocialMediaContent(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('SOCIAL_MEDIA:UPDATE')")
    public ResponseEntity<SocialMediaContent> toggleActiveStatus(@PathVariable Long id) {
        return ResponseEntity.ok(socialMediaContentService.toggleActiveStatus(id));
    }

    @PatchMapping("/{id}/order")
    @PreAuthorize("hasAuthority('SOCIAL_MEDIA:UPDATE')")
    public ResponseEntity<Void> updateDisplayOrder(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        socialMediaContentService.updateDisplayOrder(id, body.get("displayOrder"));
        return ResponseEntity.ok().build();
    }
}
