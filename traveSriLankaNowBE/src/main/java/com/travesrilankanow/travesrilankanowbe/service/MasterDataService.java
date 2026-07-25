package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.config.CacheConfig;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData.MasterDataType;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.MasterDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MasterDataService {

    private final MasterDataRepository masterDataRepository;

    public List<MasterData> getAllMasterData() {
        return masterDataRepository.findAllByOrderByTypeAscSortOrderAsc();
    }

    @Cacheable(cacheNames = CacheConfig.MASTER_DATA_CACHE, key = "'all_' + #type")
    public List<MasterData> getByType(MasterDataType type) {
        return masterDataRepository.findByTypeOrderBySortOrderAsc(type);
    }

    @Cacheable(cacheNames = CacheConfig.MASTER_DATA_CACHE, key = "'active_' + #type")
    public List<MasterData> getActiveByType(MasterDataType type) {
        return masterDataRepository.findByTypeAndIsActiveTrueOrderBySortOrderAsc(type);
    }

    public Page<MasterData> getByTypePaginated(MasterDataType type, String search, Pageable pageable) {
        return masterDataRepository.findByTypeAndSearch(type, search, pageable);
    }

    public Page<MasterData> getActiveByTypePaginated(MasterDataType type, String search, Pageable pageable) {
        return masterDataRepository.findByTypeAndIsActiveTrueAndSearch(type, search, pageable);
    }

    public MasterData getById(Long id) {
        return masterDataRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Master data not found with id: " + id));
    }

    public MasterData getByTypeAndCode(MasterDataType type, String code) {
        return masterDataRepository.findByTypeAndCode(type, code)
                .orElseThrow(() -> new ResourceNotFoundException("Master data not found with type: " + type + " and code: " + code));
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.MASTER_DATA_CACHE, allEntries = true)
    public MasterData create(MasterData masterData) {
        if (masterDataRepository.existsByTypeAndCode(masterData.getType(), masterData.getCode())) {
            throw new IllegalArgumentException("Master data with type '" + masterData.getType() + "' and code '" + masterData.getCode() + "' already exists");
        }

        MasterData saved = masterDataRepository.save(masterData);
        log.info("Master data created: {} - {}", saved.getType(), saved.getCode());
        return saved;
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.MASTER_DATA_CACHE, allEntries = true)
    public MasterData update(Long id, MasterData masterData) {
        MasterData existing = getById(id);

        if (masterDataRepository.existsByTypeAndCodeAndIdNot(masterData.getType(), masterData.getCode(), id)) {
            throw new IllegalArgumentException("Master data with type '" + masterData.getType() + "' and code '" + masterData.getCode() + "' already exists");
        }

        existing.setType(masterData.getType());
        existing.setCode(masterData.getCode());
        existing.setDisplayName(masterData.getDisplayName());
        existing.setDescription(masterData.getDescription());
        existing.setSortOrder(masterData.getSortOrder());
        existing.setIsActive(masterData.getIsActive());
        existing.setColor(masterData.getColor());
        existing.setIcon(masterData.getIcon());

        MasterData updated = masterDataRepository.save(existing);
        log.info("Master data updated: {} - {}", updated.getType(), updated.getCode());
        return updated;
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.MASTER_DATA_CACHE, allEntries = true)
    public void delete(Long id) {
        MasterData existing = getById(id);
        masterDataRepository.delete(existing);
        log.info("Master data deleted: {} - {}", existing.getType(), existing.getCode());
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.MASTER_DATA_CACHE, allEntries = true)
    public MasterData toggleActive(Long id) {
        MasterData existing = getById(id);
        existing.setIsActive(!existing.getIsActive());
        MasterData updated = masterDataRepository.save(existing);
        log.info("Master data {} status changed to: {}", updated.getCode(), updated.getIsActive() ? "active" : "inactive");
        return updated;
    }

    public List<MasterDataType> getAllTypes() {
        return List.of(MasterDataType.values());
    }
}
