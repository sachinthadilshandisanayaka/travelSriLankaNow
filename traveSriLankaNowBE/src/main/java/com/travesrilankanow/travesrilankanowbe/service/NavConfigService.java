package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.NavConfig;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.NavConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NavConfigService {

    private final NavConfigRepository navConfigRepository;

    public List<NavConfig> getVisibleNavLinks() {
        return navConfigRepository.findByIsVisibleTrueOrderByDisplayOrderAsc();
    }

    public List<NavConfig> getAllNavLinks() {
        return navConfigRepository.findAllByOrderByDisplayOrderAsc();
    }

    public NavConfig getById(Long id) {
        return navConfigRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NavConfig not found with id: " + id));
    }

    @Transactional
    public NavConfig create(NavConfig navConfig) {
        return navConfigRepository.save(navConfig);
    }

    @Transactional
    public NavConfig update(Long id, NavConfig updated) {
        NavConfig existing = getById(id);
        existing.setLabelOverride(updated.getLabelOverride());
        existing.setDisplayOrder(updated.getDisplayOrder());
        existing.setIsVisible(updated.getIsVisible());
        return navConfigRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        NavConfig existing = getById(id);
        if (Boolean.TRUE.equals(existing.getIsFixed())) {
            throw new IllegalArgumentException("Cannot delete a fixed nav item");
        }
        navConfigRepository.deleteById(id);
    }

    @Transactional
    public NavConfig toggleVisibility(Long id) {
        NavConfig existing = getById(id);
        if (Boolean.TRUE.equals(existing.getIsFixed())) {
            throw new IllegalArgumentException("Cannot hide a fixed nav item");
        }
        existing.setIsVisible(!existing.getIsVisible());
        return navConfigRepository.save(existing);
    }
}
