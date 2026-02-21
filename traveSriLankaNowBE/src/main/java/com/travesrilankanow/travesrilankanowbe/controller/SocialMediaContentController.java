package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.SocialMediaContent;
import com.travesrilankanow.travesrilankanowbe.service.SocialMediaContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/social-media-content")
@RequiredArgsConstructor
public class SocialMediaContentController {

    private final SocialMediaContentService socialMediaContentService;

    @GetMapping
    public ResponseEntity<List<SocialMediaContent>> getActiveSocialMediaContent() {
        return ResponseEntity.ok(socialMediaContentService.getActiveSocialMediaContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SocialMediaContent> getSocialMediaContentById(@PathVariable Long id) {
        return ResponseEntity.ok(socialMediaContentService.getSocialMediaContentById(id));
    }
}
