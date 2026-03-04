package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.EntityFieldConfig;
import com.travesrilankanow.travesrilankanowbe.service.EntityFieldConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/entity-field-configs")
@RequiredArgsConstructor
public class AdminEntityFieldConfigController {

    private final EntityFieldConfigService service;

    @GetMapping("/{entityType}")
    public ResponseEntity<EntityFieldConfig> getConfig(@PathVariable String entityType) {
        return ResponseEntity.ok(service.getByEntityType(entityType));
    }

    @PutMapping("/{entityType}")
    public ResponseEntity<EntityFieldConfig> upsertConfig(
            @PathVariable String entityType,
            @RequestBody List<Map<String, Object>> fieldDefinitions) {
        return ResponseEntity.ok(service.upsert(entityType, fieldDefinitions));
    }
}
