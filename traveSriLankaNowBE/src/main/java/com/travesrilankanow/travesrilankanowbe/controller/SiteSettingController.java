package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting;
import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting.SettingCategory;
import com.travesrilankanow.travesrilankanowbe.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/site-settings")
@RequiredArgsConstructor
public class SiteSettingController {

    private final SiteSettingService siteSettingService;

    @GetMapping
    public ResponseEntity<List<SiteSetting>> getActiveSettings() {
        return ResponseEntity.ok(siteSettingService.getActiveSettings());
    }

    @GetMapping("/map")
    public ResponseEntity<Map<String, String>> getActiveSettingsAsMap() {
        return ResponseEntity.ok(siteSettingService.getActiveSettingsAsMap());
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<SiteSetting>>> getActiveSettingsGrouped() {
        return ResponseEntity.ok(siteSettingService.getActiveSettingsGroupedByCategory());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SiteSetting>> getSettingsByCategory(@PathVariable String category) {
        try {
            SettingCategory settingCategory = SettingCategory.valueOf(category.toUpperCase());
            return ResponseEntity.ok(siteSettingService.getSettingsByCategory(settingCategory));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/key/{key}")
    public ResponseEntity<SiteSetting> getSettingByKey(@PathVariable String key) {
        return ResponseEntity.ok(siteSettingService.getSettingByKey(key));
    }
}
