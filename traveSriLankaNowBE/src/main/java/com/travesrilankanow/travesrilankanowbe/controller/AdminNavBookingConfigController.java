package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.BkBlackoutDate;
import com.travesrilankanow.travesrilankanowbe.entity.NavBookingConfig;
import com.travesrilankanow.travesrilankanowbe.service.NavBookingConfigService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin/nav-booking-config")
@RequiredArgsConstructor
public class AdminNavBookingConfigController {

    private final NavBookingConfigService service;

    // ── Config CRUD ─────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAuthority('NAV_CONFIG:VIEW')")
    public ResponseEntity<List<NavBookingConfig>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:VIEW')")
    public ResponseEntity<NavBookingConfig> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/by-nav/{navConfigId}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:VIEW')")
    public ResponseEntity<List<NavBookingConfig>> getByNavConfigId(@PathVariable Long navConfigId) {
        return ResponseEntity.ok(service.getAllByNavConfigId(navConfigId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<NavBookingConfig> create(@RequestBody NavBookingConfig config) {
        return ResponseEntity.ok(service.create(config));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<NavBookingConfig> update(
            @PathVariable Long id, @RequestBody NavBookingConfig config) {
        return ResponseEntity.ok(service.update(id, config));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<NavBookingConfig> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(service.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Blackout dates ──────────────────────────────────────────────────────

    @GetMapping("/{id}/blackout-dates")
    @PreAuthorize("hasAuthority('NAV_CONFIG:VIEW')")
    public ResponseEntity<List<BkBlackoutDate>> getBlackoutDates(@PathVariable Long id) {
        return ResponseEntity.ok(service.getBlackoutDates(id));
    }

    @PostMapping("/{id}/blackout-dates")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<BkBlackoutDate> addBlackoutDate(
            @PathVariable Long id, @RequestBody BlackoutDateRequest req) {
        return ResponseEntity.ok(service.addBlackoutDate(id, req.getDate(), req.getReason()));
    }

    @DeleteMapping("/{id}/blackout-dates/{dateId}")
    @PreAuthorize("hasAuthority('NAV_CONFIG:UPDATE')")
    public ResponseEntity<Void> removeBlackoutDate(
            @PathVariable Long id, @PathVariable Long dateId) {
        service.removeBlackoutDate(id, dateId);
        return ResponseEntity.noContent().build();
    }

    @Data
    static class BlackoutDateRequest {
        private LocalDate date;
        private String reason;
    }
}
