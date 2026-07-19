package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.NavConfig;
import com.travesrilankanow.travesrilankanowbe.service.NavConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/nav-config")
@RequiredArgsConstructor
public class AdminNavConfigController {

    private final NavConfigService navConfigService;

    @GetMapping
    @PreAuthorize("hasAuthority('NAV_CONFIG:VIEW')")
    public ResponseEntity<List<NavConfig>> getAllNavLinks() {
        return ResponseEntity.ok(navConfigService.getAllNavLinks());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:VIEW')")
    public ResponseEntity<NavConfig> getById(@PathVariable Long id) {
        return ResponseEntity.ok(navConfigService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<NavConfig> create(@RequestBody NavConfig navConfig) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(navConfigService.create(navConfig));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<NavConfig> update(@PathVariable Long id, @RequestBody NavConfig navConfig) {
        return ResponseEntity.ok(navConfigService.update(id, navConfig));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        navConfigService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-visibility")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<NavConfig> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(navConfigService.toggleVisibility(id));
    }
}
