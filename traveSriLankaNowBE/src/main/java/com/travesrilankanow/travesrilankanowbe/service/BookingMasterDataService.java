package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.*;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BookingMasterDataService {

    private final BkStatusRepository statusRepo;
    private final BkTypeRepository typeRepo;
    private final BkConditionRepository conditionRepo;
    private final BkTermsRepository termsRepo;
    private final BkAvailabilityConfigRepository availabilityRepo;

    // ── Statuses ──────────────────────────────────────────────────────────────

    public List<BkStatus> getAllStatuses() {
        return statusRepo.findAllByOrderByDisplayOrderAsc();
    }

    public List<BkStatus> getActiveStatuses() {
        return statusRepo.findAllByActiveTrue();
    }

    @Transactional
    public BkStatus saveStatus(BkStatus status) {
        return statusRepo.save(status);
    }

    @Transactional
    public BkStatus updateStatus(Long id, BkStatus updates) {
        BkStatus existing = statusRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Status not found: " + id));
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setActive(updates.isActive());
        existing.setTerminal(updates.isTerminal());
        existing.setAllowsEdit(updates.isAllowsEdit());
        existing.setAllowsCancel(updates.isAllowsCancel());
        existing.setDisplayOrder(updates.getDisplayOrder());
        existing.setColor(updates.getColor());
        existing.setIcon(updates.getIcon());
        return statusRepo.save(existing);
    }

    @Transactional
    public void deleteStatus(Long id) {
        statusRepo.deleteById(id);
    }

    // ── Types ─────────────────────────────────────────────────────────────────

    public List<BkType> getAllTypes() {
        return typeRepo.findAll();
    }

    public List<BkType> getActiveTypes() {
        return typeRepo.findAllByActiveTrue();
    }

    @Transactional
    public BkType saveType(BkType type) {
        return typeRepo.save(type);
    }

    @Transactional
    public BkType updateType(Long id, BkType updates) {
        BkType existing = typeRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Type not found: " + id));
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setEntityType(updates.getEntityType());
        existing.setActive(updates.isActive());
        return typeRepo.save(existing);
    }

    @Transactional
    public void deleteType(Long id) {
        typeRepo.deleteById(id);
    }

    // ── Conditions ────────────────────────────────────────────────────────────

    public List<BkCondition> getConditions(String bookingTypeCode) {
        return bookingTypeCode != null
                ? conditionRepo.findByBookingTypeCode(bookingTypeCode)
                : conditionRepo.findAll();
    }

    @Transactional
    public BkCondition saveCondition(BkCondition condition) {
        return conditionRepo.save(condition);
    }

    @Transactional
    public BkCondition updateCondition(Long id, BkCondition updates) {
        BkCondition existing = conditionRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Condition not found: " + id));
        existing.setConditionType(updates.getConditionType());
        existing.setConditionValue(updates.getConditionValue());
        existing.setDescription(updates.getDescription());
        existing.setActive(updates.isActive());
        return conditionRepo.save(existing);
    }

    @Transactional
    public void deleteCondition(Long id) {
        conditionRepo.deleteById(id);
    }

    // ── Terms & Conditions ────────────────────────────────────────────────────

    public List<BkTerms> getTerms(String bookingTypeCode) {
        return bookingTypeCode != null
                ? termsRepo.findByBookingTypeCodeAndActiveTrue(bookingTypeCode)
                : termsRepo.findAll();
    }

    public Optional<BkTerms> getCurrentTerms(String bookingTypeCode) {
        return termsRepo.findCurrentActiveTerms(bookingTypeCode, LocalDate.now());
    }

    @Transactional
    public BkTerms saveTerms(BkTerms terms) {
        return termsRepo.save(terms);
    }

    @Transactional
    public BkTerms updateTerms(Long id, BkTerms updates) {
        BkTerms existing = termsRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Terms not found: " + id));
        existing.setTitle(updates.getTitle());
        existing.setContent(updates.getContent());
        existing.setVersion(updates.getVersion());
        existing.setActive(updates.isActive());
        existing.setEffectiveFrom(updates.getEffectiveFrom());
        existing.setEffectiveTo(updates.getEffectiveTo());
        return termsRepo.save(existing);
    }

    @Transactional
    public BkTerms activateTerms(Long id) {
        BkTerms target = termsRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Terms not found: " + id));
        // Deactivate all others for same booking type
        termsRepo.findByBookingTypeCode(target.getBookingTypeCode())
                .forEach(t -> { if (!t.getId().equals(id)) { t.setActive(false); termsRepo.save(t); } });
        target.setActive(true);
        return termsRepo.save(target);
    }

    @Transactional
    public void deleteTerms(Long id) {
        termsRepo.deleteById(id);
    }

    // ── Availability Config ───────────────────────────────────────────────────

    public List<BkAvailabilityConfig> getAvailabilityConfigs(String bookingTypeCode) {
        return bookingTypeCode != null
                ? availabilityRepo.findByBookingTypeCodeAndActiveTrue(bookingTypeCode)
                : availabilityRepo.findAll();
    }

    @Transactional
    public BkAvailabilityConfig saveAvailabilityConfig(BkAvailabilityConfig config) {
        return availabilityRepo.save(config);
    }

    @Transactional
    public BkAvailabilityConfig updateAvailabilityConfig(Long id, BkAvailabilityConfig updates) {
        BkAvailabilityConfig existing = availabilityRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Availability config not found: " + id));
        existing.setEntityId(updates.getEntityId());
        existing.setAllowMultiplePerDate(updates.isAllowMultiplePerDate());
        existing.setMaxBookingsPerDate(updates.getMaxBookingsPerDate());
        existing.setActive(updates.isActive());
        return availabilityRepo.save(existing);
    }

    @Transactional
    public void deleteAvailabilityConfig(Long id) {
        availabilityRepo.deleteById(id);
    }
}
