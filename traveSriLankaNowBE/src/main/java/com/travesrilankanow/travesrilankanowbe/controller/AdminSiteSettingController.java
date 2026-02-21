package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting;
import com.travesrilankanow.travesrilankanowbe.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/site-settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSiteSettingController {

    private final SiteSettingService siteSettingService;

    @GetMapping
    public ResponseEntity<List<SiteSetting>> getAllSettings() {
        return ResponseEntity.ok(siteSettingService.getAllSettings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteSetting> getSettingById(@PathVariable Long id) {
        return ResponseEntity.ok(siteSettingService.getSettingById(id));
    }

    @PostMapping
    public ResponseEntity<SiteSetting> createSetting(@RequestBody SiteSetting setting) {
        return ResponseEntity.ok(siteSettingService.createSetting(setting));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiteSetting> updateSetting(@PathVariable Long id, @RequestBody SiteSetting setting) {
        setting.setId(id);
        return ResponseEntity.ok(siteSettingService.updateSetting(setting));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSetting(@PathVariable Long id) {
        siteSettingService.deleteSetting(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<SiteSetting> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(siteSettingService.toggleStatus(id));
    }
}
