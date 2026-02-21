package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting;
import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting.SettingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteSettingRepository extends JpaRepository<SiteSetting, Long> {

    Optional<SiteSetting> findByKey(String key);

    List<SiteSetting> findByCategory(SettingCategory category);

    List<SiteSetting> findByCategoryAndIsActiveTrue(SettingCategory category);

    List<SiteSetting> findByIsActiveTrueOrderByCategoryAscSortOrderAsc();

    List<SiteSetting> findAllByOrderByCategoryAscSortOrderAsc();

    boolean existsByKey(String key);
}
