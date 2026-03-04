package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.EntityFieldConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EntityFieldConfigRepository extends JpaRepository<EntityFieldConfig, Long> {
    Optional<EntityFieldConfig> findByEntityType(String entityType);
}
