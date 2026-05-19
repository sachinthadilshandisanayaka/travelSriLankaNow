package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BkAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BkAuditLogRepository extends JpaRepository<BkAuditLog, Long> {
    List<BkAuditLog> findByBookingIdOrderByChangedAtDesc(Long bookingId);
}
