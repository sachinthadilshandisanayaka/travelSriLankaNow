package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.NavBookingConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavBookingConfigRepository extends JpaRepository<NavBookingConfig, Long> {

    List<NavBookingConfig> findByNavConfigIdOrderByBookingTypeCode(Long navConfigId);

    List<NavBookingConfig> findByNavConfigIdAndIsActiveTrueOrderByBookingTypeCode(Long navConfigId);

    @Query("SELECT c FROM NavBookingConfig c WHERE c.navConfig.routePath = :routePath AND c.isActive = true")
    List<NavBookingConfig> findActiveByRoutePath(String routePath);

    @Query("SELECT c FROM NavBookingConfig c WHERE c.navConfig.routePath = :routePath")
    List<NavBookingConfig> findAllByRoutePath(String routePath);

    List<NavBookingConfig> findByBookingTypeCodeAndIsActiveTrueOrderByNavConfigId(String bookingTypeCode);

    boolean existsByNavConfigIdAndBookingTypeCode(Long navConfigId, String bookingTypeCode);
}
