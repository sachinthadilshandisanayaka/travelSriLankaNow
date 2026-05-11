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
@PreAuthorize("hasRole('ADMIN')")
public class AdminNavConfigController {

    private final NavConfigService navConfigService;

    @GetMapping
    public ResponseEntity<List<NavConfig>> getAllNavLinks() {
        return ResponseEntity.ok(navConfigService.getAllNavLinks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NavConfig> getById(@PathVariable Long id) {
        return ResponseEntity.ok(navConfigService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NavConfig> update(@PathVariable Long id, @RequestBody NavConfig navConfig) {
        return ResponseEntity.ok(navConfigService.update(id, navConfig));
    }

    @PatchMapping("/{id}/toggle-visibility")
    public ResponseEntity<NavConfig> toggleVisibility(@PathVariable Long id) {
        return ResponseEntity.ok(navConfigService.toggleVisibility(id));
    }
}
