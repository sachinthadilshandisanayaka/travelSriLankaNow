package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.PageHeaderBackground;
import com.travesrilankanow.travesrilankanowbe.entity.PageType;
import com.travesrilankanow.travesrilankanowbe.service.PageHeaderBackgroundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/page-header-backgrounds")
@RequiredArgsConstructor
public class PageHeaderBackgroundController {

    private final PageHeaderBackgroundService pageHeaderBackgroundService;

    @GetMapping("/{pageType}")
    public ResponseEntity<PageHeaderBackground> getActiveBackgroundByPageType(@PathVariable String pageType) {
        try {
            PageType type = PageType.valueOf(pageType.toUpperCase());
            return pageHeaderBackgroundService.getActiveBackgroundByPageType(type)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
