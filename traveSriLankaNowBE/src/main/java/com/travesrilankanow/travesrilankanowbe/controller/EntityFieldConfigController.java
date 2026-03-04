package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.EntityFieldConfig;
import com.travesrilankanow.travesrilankanowbe.service.EntityFieldConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/entity-field-configs")
@RequiredArgsConstructor
public class EntityFieldConfigController {

    private final EntityFieldConfigService service;

    @GetMapping("/{entityType}")
    public ResponseEntity<EntityFieldConfig> getConfig(@PathVariable String entityType) {
        return ResponseEntity.ok(service.getByEntityType(entityType));
    }
}
