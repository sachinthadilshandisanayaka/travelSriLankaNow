package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.EntityFieldConfig;
import com.travesrilankanow.travesrilankanowbe.repository.EntityFieldConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EntityFieldConfigService {

    private final EntityFieldConfigRepository repository;

    public EntityFieldConfig getByEntityType(String entityType) {
        return repository.findByEntityType(entityType)
                .orElseGet(() -> {
                    EntityFieldConfig empty = new EntityFieldConfig();
                    empty.setEntityType(entityType);
                    empty.setFieldDefinitions(new ArrayList<>());
                    return empty;
                });
    }

    @Transactional
    public EntityFieldConfig upsert(String entityType, List<Map<String, Object>> fieldDefinitions) {
        EntityFieldConfig config = repository.findByEntityType(entityType)
                .orElse(new EntityFieldConfig());
        config.setEntityType(entityType);
        config.setFieldDefinitions(fieldDefinitions);
        return repository.save(config);
    }
}
