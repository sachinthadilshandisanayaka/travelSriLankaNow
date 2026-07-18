package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.NavBookingConfig;
import com.travesrilankanow.travesrilankanowbe.service.NavBookingConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Public (unauthenticated) endpoint — returns active booking rules for a nav
 * route so the frontend can adapt its booking form behaviour dynamically.
 */
@RestController
@RequestMapping("/api/nav-booking-config")
@RequiredArgsConstructor
public class NavBookingConfigController {

    private final NavBookingConfigService service;

    /** GET /api/nav-booking-config?routePath=/events */
    @GetMapping
    public ResponseEntity<List<NavBookingConfig>> getByRoutePath(
            @RequestParam String routePath) {
        return ResponseEntity.ok(service.getActiveByRoutePath(routePath));
    }
}
