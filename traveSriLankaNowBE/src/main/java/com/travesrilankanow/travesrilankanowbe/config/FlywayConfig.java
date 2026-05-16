package com.travesrilankanow.travesrilankanowbe.config;

import org.springframework.boot.flyway.autoconfigure.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    /**
     * Repair then migrate — clears any FAILED migration state in flyway_schema_history
     * before applying pending migrations. Handles deployments where a previous run
     * crashed mid-migration and left a broken state that would block all future startups.
     */
    @Bean
    public FlywayMigrationStrategy repairAndMigrate() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}
