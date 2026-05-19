package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.BkAuditLog;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.repository.BkAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingAuditService {

    private final BkAuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRED)
    public void logCreated(EventBooking booking, String createdBy) {
        save(booking.getId(), "CREATED", null,
                booking.getStatus() != null ? booking.getStatus().name() : null,
                createdBy, null);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void logStatusChange(Long bookingId, String oldStatus, String newStatus,
                                 String changedBy, String reason) {
        save(bookingId, "STATUS_CHANGED", oldStatus, newStatus, changedBy, reason);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void logEdited(Long bookingId, String editedBy) {
        save(bookingId, "EDITED", null, null, editedBy, null);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void logCancelled(Long bookingId, String oldStatus, String cancelledBy, String reason) {
        save(bookingId, "CANCELLED", oldStatus, "cancelled", cancelledBy, reason);
    }

    public List<BkAuditLog> getHistory(Long bookingId) {
        return auditLogRepository.findByBookingIdOrderByChangedAtDesc(bookingId);
    }

    private void save(Long bookingId, String action, String oldStatus, String newStatus,
                      String changedBy, String reason) {
        BkAuditLog log = new BkAuditLog();
        log.setBookingId(bookingId);
        log.setAction(action);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setChangedBy(changedBy);
        log.setChangedAt(LocalDateTime.now());
        log.setChangeReason(reason);
        auditLogRepository.save(log);
    }
}
