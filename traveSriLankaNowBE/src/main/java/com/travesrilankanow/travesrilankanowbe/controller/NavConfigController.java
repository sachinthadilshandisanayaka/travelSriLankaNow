package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.NavConfig;
import com.travesrilankanow.travesrilankanowbe.service.NavConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nav-config")
@RequiredArgsConstructor
public class NavConfigController {

    private final NavConfigService navConfigService;

    @GetMapping
    public ResponseEntity<List<NavConfig>> getVisibleNavLinks() {
        return ResponseEntity.ok(navConfigService.getVisibleNavLinks());
    }
}
