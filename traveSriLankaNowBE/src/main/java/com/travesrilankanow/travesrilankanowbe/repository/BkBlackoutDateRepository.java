package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BkBlackoutDate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BkBlackoutDateRepository extends JpaRepository<BkBlackoutDate, Long> {

    List<BkBlackoutDate> findByNavBookingConfigIdOrderByBlackoutDate(Long navBookingConfigId);

    boolean existsByNavBookingConfigIdAndBlackoutDate(Long navBookingConfigId, LocalDate blackoutDate);

    List<BkBlackoutDate> findByNavBookingConfigIdAndBlackoutDateBetween(
            Long navBookingConfigId, LocalDate from, LocalDate to);
}
