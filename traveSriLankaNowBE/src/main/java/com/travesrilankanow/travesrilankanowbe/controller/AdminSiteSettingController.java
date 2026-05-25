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
public class AdminSiteSettingController {

    private final SiteSettingService siteSettingService;

    @GetMapping
    @PreAuthorize("hasAuthority('SITE_SETTINGS:VIEW')")
    public ResponseEntity<List<SiteSetting>> getAllSettings() {
        return ResponseEntity.ok(siteSettingService.getAllSettings());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SITE_SETTINGS:VIEW')")
    public ResponseEntity<SiteSetting> getSettingById(@PathVariable Long id) {
        return ResponseEntity.ok(siteSettingService.getSettingById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SITE_SETTINGS:CREATE')")
    public ResponseEntity<SiteSetting> createSetting(@RequestBody SiteSetting setting) {
        return ResponseEntity.ok(siteSettingService.createSetting(setting));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SITE_SETTINGS:UPDATE')")
    public ResponseEntity<SiteSetting> updateSetting(@PathVariable Long id, @RequestBody SiteSetting setting) {
        setting.setId(id);
        return ResponseEntity.ok(siteSettingService.updateSetting(setting));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SITE_SETTINGS:DELETE')")
    public ResponseEntity<Void> deleteSetting(@PathVariable Long id) {
        siteSettingService.deleteSetting(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasAuthority('SITE_SETTINGS:UPDATE')")
    public ResponseEntity<SiteSetting> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(siteSettingService.toggleStatus(id));
    }

    @PostMapping("/upsert")
    @PreAuthorize("hasAuthority('SITE_SETTINGS:UPDATE')")
    public ResponseEntity<SiteSetting> upsertSetting(@RequestBody SiteSetting setting) {
        return ResponseEntity.ok(siteSettingService.upsertSetting(setting));
    }
}
