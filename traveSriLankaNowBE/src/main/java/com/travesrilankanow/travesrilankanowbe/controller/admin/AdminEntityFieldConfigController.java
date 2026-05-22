package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.EntityFieldConfig;
import com.travesrilankanow.travesrilankanowbe.service.EntityFieldConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/entity-field-configs")
@RequiredArgsConstructor
public class AdminEntityFieldConfigController {

    private final EntityFieldConfigService service;

    @GetMapping("/{entityType}")
    @PreAuthorize("hasAuthority('ENTITY_FIELDS:VIEW')")
    public ResponseEntity<EntityFieldConfig> getConfig(@PathVariable String entityType) {
        return ResponseEntity.ok(service.getByEntityType(entityType));
    }

    @PutMapping("/{entityType}")
    @PreAuthorize("hasAuthority('ENTITY_FIELDS:UPDATE')")
    public ResponseEntity<EntityFieldConfig> upsertConfig(
            @PathVariable String entityType,
            @RequestBody List<Map<String, Object>> fieldDefinitions) {
        return ResponseEntity.ok(service.upsert(entityType, fieldDefinitions));
    }
}
