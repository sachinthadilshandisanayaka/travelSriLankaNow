package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BkCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BkConditionRepository extends JpaRepository<BkCondition, Long> {
    List<BkCondition> findByBookingTypeCodeAndActiveTrue(String bookingTypeCode);
    List<BkCondition> findByBookingTypeCode(String bookingTypeCode);
}
