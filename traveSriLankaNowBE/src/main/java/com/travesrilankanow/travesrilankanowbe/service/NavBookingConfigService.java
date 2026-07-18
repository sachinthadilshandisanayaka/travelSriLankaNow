package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.BkBlackoutDate;
import com.travesrilankanow.travesrilankanowbe.entity.NavBookingConfig;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.BkBlackoutDateRepository;
import com.travesrilankanow.travesrilankanowbe.repository.NavBookingConfigRepository;
import com.travesrilankanow.travesrilankanowbe.repository.NavConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NavBookingConfigService {

    private final NavBookingConfigRepository configRepo;
    private final BkBlackoutDateRepository blackoutRepo;
    private final NavConfigRepository navConfigRepo;

    // ── Read ────────────────────────────────────────────────────────────────

    public List<NavBookingConfig> getAll() {
        return configRepo.findAll();
    }

    public NavBookingConfig getById(Long id) {
        return configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("NavBookingConfig not found: " + id));
    }

    /** Public API — returns only active rules for a given route path. */
    public List<NavBookingConfig> getActiveByRoutePath(String routePath) {
        return configRepo.findActiveByRoutePath(routePath);
    }

    /** Admin API — returns all rules (including inactive) for a nav config item. */
    public List<NavBookingConfig> getAllByNavConfigId(Long navConfigId) {
        return configRepo.findByNavConfigIdOrderByBookingTypeCode(navConfigId);
    }

    // ── Write ───────────────────────────────────────────────────────────────

    @Transactional
    public NavBookingConfig create(NavBookingConfig config) {
        if (!navConfigRepo.existsById(config.getNavConfigId())) {
            throw new ResourceNotFoundException("NavConfig not found: " + config.getNavConfigId());
        }
        if (configRepo.existsByNavConfigIdAndBookingTypeCode(
                config.getNavConfigId(), config.getBookingTypeCode())) {
            throw new IllegalStateException(
                    "A rule for booking type '" + config.getBookingTypeCode()
                    + "' already exists on this nav item.");
        }
        return configRepo.save(config);
    }

    @Transactional
    public NavBookingConfig update(Long id, NavBookingConfig updates) {
        NavBookingConfig existing = getById(id);
        existing.setBookingTypeCode(updates.getBookingTypeCode());
        existing.setDateMode(updates.getDateMode());
        existing.setMinLeadDays(updates.getMinLeadDays());
        existing.setMaxAdvanceDays(updates.getMaxAdvanceDays());
        existing.setMinStayDays(updates.getMinStayDays());
        existing.setMaxStayDays(updates.getMaxStayDays());
        existing.setMinParty(updates.getMinParty());
        existing.setMaxParty(updates.getMaxParty());
        existing.setRequireAuth(updates.getRequireAuth());
        existing.setAllowedDow(updates.getAllowedDow());
        existing.setBookingOpenFrom(updates.getBookingOpenFrom());
        existing.setBookingOpenTo(updates.getBookingOpenTo());
        existing.setExtraConfig(updates.getExtraConfig());
        existing.setIsActive(updates.getIsActive());
        return configRepo.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        configRepo.delete(getById(id));
    }

    @Transactional
    public NavBookingConfig toggleActive(Long id) {
        NavBookingConfig c = getById(id);
        c.setIsActive(!Boolean.TRUE.equals(c.getIsActive()));
        return configRepo.save(c);
    }

    // ── Blackout dates ──────────────────────────────────────────────────────

    public List<BkBlackoutDate> getBlackoutDates(Long configId) {
        getById(configId); // ensure parent exists
        return blackoutRepo.findByNavBookingConfigIdOrderByBlackoutDate(configId);
    }

    @Transactional
    public BkBlackoutDate addBlackoutDate(Long configId, LocalDate date, String reason) {
        getById(configId);
        if (blackoutRepo.existsByNavBookingConfigIdAndBlackoutDate(configId, date)) {
            throw new IllegalStateException("Blackout date already exists: " + date);
        }
        return blackoutRepo.save(BkBlackoutDate.builder()
                .navBookingConfigId(configId)
                .blackoutDate(date)
                .reason(reason)
                .build());
    }

    @Transactional
    public void removeBlackoutDate(Long configId, Long dateId) {
        BkBlackoutDate b = blackoutRepo.findById(dateId)
                .orElseThrow(() -> new ResourceNotFoundException("Blackout date not found: " + dateId));
        if (!b.getNavBookingConfigId().equals(configId)) {
            throw new IllegalArgumentException("Blackout date does not belong to config " + configId);
        }
        blackoutRepo.delete(b);
    }

    // ── Validation (used by EventBookingService) ────────────────────────────

    /**
     * Validates a booking date against all active NavBookingConfig rules for
     * the given route path. Throws IllegalStateException on any violation.
     *
     * @param routePath  the nav route that initiated the booking (e.g. "/events")
     * @param date       the customer's requested date (start date for RANGE mode)
     * @param endDate    the end date for RANGE mode bookings (may be null)
     * @param partySize  number of participants
     * @param isAuthenticated whether the customer is logged in
     */
    public void validateBooking(String routePath, LocalDate date, LocalDate endDate,
                                Integer partySize, boolean isAuthenticated) {
        if (routePath == null || routePath.isBlank()) return;

        List<NavBookingConfig> rules = configRepo.findActiveByRoutePath(routePath);
        if (rules.isEmpty()) return; // no rules configured → allow

        for (NavBookingConfig rule : rules) {
            validateAgainstRule(rule, date, endDate, partySize, isAuthenticated);
        }
    }

    private void validateAgainstRule(NavBookingConfig rule, LocalDate date, LocalDate endDate,
                                     Integer partySize, boolean isAuthenticated) {

        // Auth check
        if (Boolean.TRUE.equals(rule.getRequireAuth()) && !isAuthenticated) {
            throw new IllegalStateException("You must be logged in to make this booking.");
        }

        if ("NONE".equals(rule.getDateMode()) || date == null) return;

        LocalDate today = LocalDate.now();

        // Seasonal booking window
        if (rule.getBookingOpenFrom() != null && today.isBefore(rule.getBookingOpenFrom())) {
            throw new IllegalStateException(
                    "Bookings for this section open from " + rule.getBookingOpenFrom() + ".");
        }
        if (rule.getBookingOpenTo() != null && today.isAfter(rule.getBookingOpenTo())) {
            throw new IllegalStateException(
                    "Bookings for this section closed on " + rule.getBookingOpenTo() + ".");
        }

        // Minimum lead time
        if (rule.getMinLeadDays() != null && rule.getMinLeadDays() > 0) {
            LocalDate earliest = today.plusDays(rule.getMinLeadDays());
            if (date.isBefore(earliest)) {
                throw new IllegalStateException(
                        "Bookings must be placed at least " + rule.getMinLeadDays()
                        + " day(s) in advance. Earliest available date: " + earliest + ".");
            }
        }

        // Maximum advance booking window
        if (rule.getMaxAdvanceDays() != null) {
            LocalDate latest = today.plusDays(rule.getMaxAdvanceDays());
            if (date.isAfter(latest)) {
                throw new IllegalStateException(
                        "Bookings cannot be placed more than " + rule.getMaxAdvanceDays()
                        + " day(s) in advance. Latest available date: " + latest + ".");
            }
        }

        // Day-of-week restriction
        if (rule.getAllowedDow() != null) {
            int dow = date.getDayOfWeek().getValue() - 1; // Mon=0 … Sun=6
            if ((rule.getAllowedDow() & (1 << dow)) == 0) {
                throw new IllegalStateException(
                        date.getDayOfWeek().name().charAt(0)
                        + date.getDayOfWeek().name().substring(1).toLowerCase()
                        + " is not an available day for this booking.");
            }
        }

        // Blackout date check
        List<BkBlackoutDate> blackouts = blackoutRepo
                .findByNavBookingConfigIdOrderByBlackoutDate(rule.getId());
        for (BkBlackoutDate b : blackouts) {
            if (b.getBlackoutDate().equals(date)) {
                String reason = b.getReason() != null ? " (" + b.getReason() + ")" : "";
                throw new IllegalStateException(
                        date + " is not available for booking" + reason + ".");
            }
        }

        // RANGE mode: stay duration
        if ("RANGE".equals(rule.getDateMode()) && endDate != null) {
            long nights = date.until(endDate).getDays();
            if (rule.getMinStayDays() != null && nights < rule.getMinStayDays()) {
                throw new IllegalStateException(
                        "Minimum stay is " + rule.getMinStayDays() + " night(s).");
            }
            if (rule.getMaxStayDays() != null && nights > rule.getMaxStayDays()) {
                throw new IllegalStateException(
                        "Maximum stay is " + rule.getMaxStayDays() + " night(s).");
            }
        }

        // Party size
        if (partySize != null) {
            if (rule.getMinParty() != null && partySize < rule.getMinParty()) {
                throw new IllegalStateException(
                        "Minimum party size is " + rule.getMinParty() + " person(s).");
            }
            if (rule.getMaxParty() != null && partySize > rule.getMaxParty()) {
                throw new IllegalStateException(
                        "Maximum party size is " + rule.getMaxParty() + " person(s).");
            }
        }
    }

    /**
     * Returns all blackout dates for a route path within a given month,
     * used to merge into the public blocked-dates API response.
     */
    public List<LocalDate> getBlackoutDatesForMonth(String routePath, int year, int month) {
        LocalDate from = LocalDate.of(year, month, 1);
        LocalDate to   = from.withDayOfMonth(from.lengthOfMonth());

        return configRepo.findActiveByRoutePath(routePath).stream()
                .flatMap(rule -> blackoutRepo
                        .findByNavBookingConfigIdAndBlackoutDateBetween(rule.getId(), from, to)
                        .stream()
                        .map(BkBlackoutDate::getBlackoutDate))
                .distinct()
                .sorted()
                .toList();
    }
}
