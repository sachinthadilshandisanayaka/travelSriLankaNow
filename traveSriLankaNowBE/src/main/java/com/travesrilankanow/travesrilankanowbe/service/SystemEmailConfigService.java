package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.config.CacheConfig;
import com.travesrilankanow.travesrilankanowbe.dto.SystemEmailConfigRequest;
import com.travesrilankanow.travesrilankanowbe.entity.SystemEmailConfig;
import com.travesrilankanow.travesrilankanowbe.repository.SystemEmailConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SystemEmailConfigService {

    private final SystemEmailConfigRepository repository;

    @Cacheable(cacheNames = CacheConfig.EMAIL_CONFIG_CACHE, key = "'singleton'")
    public SystemEmailConfig getConfig() {
        return repository.findTopByOrderByIdAsc().orElseGet(SystemEmailConfig::new);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.EMAIL_CONFIG_CACHE, allEntries = true)
    public SystemEmailConfig updateConfig(SystemEmailConfigRequest req) {
        SystemEmailConfig cfg = repository.findTopByOrderByIdAsc().orElseGet(SystemEmailConfig::new);
        cfg.setSmtpHost(req.getSmtpHost());
        cfg.setSmtpPort(req.getSmtpPort());
        cfg.setSmtpUsername(req.getSmtpUsername());
        if (req.getSmtpPassword() != null && !req.getSmtpPassword().isBlank()) {
            cfg.setSmtpPassword(req.getSmtpPassword());
        }
        if (req.getUseTls() != null) cfg.setUseTls(req.getUseTls());
        cfg.setFromEmail(req.getFromEmail());
        cfg.setFromName(req.getFromName());
        cfg.setOwnerNotificationEmail(req.getOwnerNotificationEmail());
        if (req.getIsActive() != null) cfg.setIsActive(req.getIsActive());
        return repository.save(cfg);
    }
}
