package com.travesrilankanow.travesrilankanowbe.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * In-process cache for near-static read endpoints (master-data, site-settings).
 * These change a few times a month but are fetched on every fresh page load,
 * so a short TTL removes redundant Postgres round trips without needing a
 * separate cache server (no horizontal scaling of the backend today).
 */
@Configuration
@EnableCaching
public class CacheConfig {

    public static final String MASTER_DATA_CACHE = "masterData";
    public static final String SITE_SETTINGS_CACHE = "siteSettings";
    public static final String EMAIL_CONFIG_CACHE = "emailConfig";
    public static final String EMAIL_TEMPLATE_CACHE = "emailTemplates";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager(
                MASTER_DATA_CACHE, SITE_SETTINGS_CACHE, EMAIL_CONFIG_CACHE, EMAIL_TEMPLATE_CACHE);
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(10, TimeUnit.MINUTES)
                .maximumSize(500));
        return manager;
    }
}
