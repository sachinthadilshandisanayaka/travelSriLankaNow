package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.config.CacheConfig;
import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting;
import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting.SettingCategory;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SiteSettingService {

    private final SiteSettingRepository siteSettingRepository;

    public List<SiteSetting> getAllSettings() {
        return siteSettingRepository.findAllByOrderByCategoryAscSortOrderAsc();
    }

    @Cacheable(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, key = "'active'")
    public List<SiteSetting> getActiveSettings() {
        return siteSettingRepository.findByIsActiveTrueOrderByCategoryAscSortOrderAsc();
    }

    public SiteSetting getSettingById(Long id) {
        return siteSettingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
    }

    @Cacheable(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, key = "'key_' + #key")
    public SiteSetting getSettingByKey(String key) {
        return siteSettingRepository.findByKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with key: " + key));
    }

    public List<SiteSetting> getSettingsByCategory(SettingCategory category) {
        return siteSettingRepository.findByCategoryAndIsActiveTrue(category);
    }

    @Cacheable(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, key = "'map'")
    public Map<String, String> getActiveSettingsAsMap() {
        return siteSettingRepository.findByIsActiveTrueOrderByCategoryAscSortOrderAsc()
                .stream()
                .collect(Collectors.toMap(SiteSetting::getKey, SiteSetting::getValue));
    }

    public Map<String, List<SiteSetting>> getActiveSettingsGroupedByCategory() {
        return siteSettingRepository.findByIsActiveTrueOrderByCategoryAscSortOrderAsc()
                .stream()
                .collect(Collectors.groupingBy(s -> s.getCategory().name()));
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, allEntries = true)
    public SiteSetting createSetting(SiteSetting setting) {
        if (siteSettingRepository.existsByKey(setting.getKey())) {
            throw new IllegalArgumentException("Setting with key '" + setting.getKey() + "' already exists");
        }
        return siteSettingRepository.save(setting);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, allEntries = true)
    public SiteSetting upsertSetting(SiteSetting setting) {
        return siteSettingRepository.findByKey(setting.getKey())
                .map(existing -> {
                    existing.setCategory(setting.getCategory());
                    existing.setLabel(setting.getLabel());
                    existing.setValue(setting.getValue());
                    existing.setIcon(setting.getIcon());
                    existing.setSortOrder(setting.getSortOrder());
                    if (setting.getIsActive() != null) existing.setIsActive(setting.getIsActive());
                    return siteSettingRepository.save(existing);
                })
                .orElseGet(() -> {
                    SiteSetting newSetting = SiteSetting.builder()
                            .category(setting.getCategory())
                            .key(setting.getKey())
                            .label(setting.getLabel())
                            .value(setting.getValue())
                            .icon(setting.getIcon())
                            .sortOrder(setting.getSortOrder())
                            .isActive(setting.getIsActive() != null ? setting.getIsActive() : true)
                            .build();
                    return siteSettingRepository.save(newSetting);
                });
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, allEntries = true)
    public SiteSetting updateSetting(SiteSetting setting) {
        SiteSetting existingSetting = siteSettingRepository.findById(setting.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + setting.getId()));

        existingSetting.setCategory(setting.getCategory());
        existingSetting.setKey(setting.getKey());
        existingSetting.setLabel(setting.getLabel());
        existingSetting.setValue(setting.getValue());
        existingSetting.setIcon(setting.getIcon());
        existingSetting.setSortOrder(setting.getSortOrder());
        existingSetting.setIsActive(setting.getIsActive());

        return siteSettingRepository.save(existingSetting);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, allEntries = true)
    public void deleteSetting(Long id) {
        if (!siteSettingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Setting not found with id: " + id);
        }
        siteSettingRepository.deleteById(id);
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.SITE_SETTINGS_CACHE, allEntries = true)
    public SiteSetting toggleStatus(Long id) {
        SiteSetting setting = siteSettingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Setting not found with id: " + id));
        setting.setIsActive(!setting.getIsActive());
        return siteSettingRepository.save(setting);
    }
}
