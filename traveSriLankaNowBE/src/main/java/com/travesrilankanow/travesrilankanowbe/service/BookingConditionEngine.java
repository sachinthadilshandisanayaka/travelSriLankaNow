package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.BkCondition;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.repository.BkConditionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingConditionEngine {

    private final BkConditionRepository conditionRepository;

    public boolean canCancel(EventBooking booking) {
        return getFirstCancelViolation(booking) == null;
    }

    public boolean canEdit(EventBooking booking) {
        return getFirstEditViolation(booking) == null;
    }

    public String getCancelViolationReason(EventBooking booking) {
        return getFirstCancelViolation(booking);
    }

    public String getEditViolationReason(EventBooking booking) {
        return getFirstEditViolation(booking);
    }

    private String getFirstCancelViolation(EventBooking booking) {
        String typeCode = booking.getBookingType() != null ? booking.getBookingType() : "EVENT";
        List<BkCondition> conditions = conditionRepository.findByBookingTypeCodeAndActiveTrue(typeCode);
        for (BkCondition c : conditions) {
            if (!evaluateForCancel(c, booking)) {
                return c.getDescription() != null ? c.getDescription() : "Cancellation not allowed: " + c.getConditionType();
            }
        }
        return null;
    }

    private String getFirstEditViolation(EventBooking booking) {
        String typeCode = booking.getBookingType() != null ? booking.getBookingType() : "EVENT";
        List<BkCondition> conditions = conditionRepository.findByBookingTypeCodeAndActiveTrue(typeCode);
        for (BkCondition c : conditions) {
            if (!evaluateForEdit(c, booking)) {
                return c.getDescription() != null ? c.getDescription() : "Editing not allowed: " + c.getConditionType();
            }
        }
        return null;
    }

    private boolean evaluateForCancel(BkCondition condition, EventBooking booking) {
        try {
            int value = Integer.parseInt(condition.getConditionValue().trim());
            switch (condition.getConditionType()) {
                case "CANCEL_WITHIN_DAYS":
                    LocalDateTime createdAt = booking.getCreatedDate() != null
                            ? booking.getCreatedDate() : booking.getBookingDate();
                    return createdAt != null && LocalDateTime.now().isBefore(createdAt.plusDays(value));
                case "CANCEL_BEFORE_EVENT_DAYS":
                    if (booking.getRequestedDate() == null) return true;
                    return LocalDate.now().plusDays(value).isBefore(booking.getRequestedDate())
                            || LocalDate.now().plusDays(value).isEqual(booking.getRequestedDate());
                default:
                    return true;
            }
        } catch (NumberFormatException e) {
            return true;
        }
    }

    private boolean evaluateForEdit(BkCondition condition, EventBooking booking) {
        try {
            int value = Integer.parseInt(condition.getConditionValue().trim());
            switch (condition.getConditionType()) {
                case "EDIT_WITHIN_DAYS":
                    LocalDateTime createdAt = booking.getCreatedDate() != null
                            ? booking.getCreatedDate() : booking.getBookingDate();
                    return createdAt != null && LocalDateTime.now().isBefore(createdAt.plusDays(value));
                case "EDIT_BEFORE_EVENT_DAYS":
                    if (booking.getRequestedDate() == null) return true;
                    return LocalDate.now().plusDays(value).isBefore(booking.getRequestedDate())
                            || LocalDate.now().plusDays(value).isEqual(booking.getRequestedDate());
                default:
                    return true;
            }
        } catch (NumberFormatException e) {
            return true;
        }
    }
}
