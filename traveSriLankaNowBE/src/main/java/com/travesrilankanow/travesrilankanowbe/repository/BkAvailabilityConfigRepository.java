package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BkAvailabilityConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BkAvailabilityConfigRepository extends JpaRepository<BkAvailabilityConfig, Long> {
    List<BkAvailabilityConfig> findByBookingTypeCodeAndActiveTrue(String bookingTypeCode);

    /** Specific entity config takes priority over wildcard (entityId = null) */
    Optional<BkAvailabilityConfig> findByBookingTypeCodeAndEntityIdAndActiveTrue(
            String bookingTypeCode, Long entityId);

    Optional<BkAvailabilityConfig> findByBookingTypeCodeAndEntityIdIsNullAndActiveTrue(
            String bookingTypeCode);
}
