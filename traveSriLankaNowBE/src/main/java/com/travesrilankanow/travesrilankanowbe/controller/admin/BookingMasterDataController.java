package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.*;
import com.travesrilankanow.travesrilankanowbe.service.BookingMasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/booking-settings")
@RequiredArgsConstructor
public class BookingMasterDataController {

    private final BookingMasterDataService masterDataService;

    // ── Statuses ──────────────────────────────────────────────────────────────

    @GetMapping("/statuses")
    public List<BkStatus> getStatuses() {
        return masterDataService.getAllStatuses();
    }

    @PostMapping("/statuses")
    public ResponseEntity<BkStatus> createStatus(@RequestBody BkStatus status) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.saveStatus(status));
    }

    @PutMapping("/statuses/{id}")
    public ResponseEntity<BkStatus> updateStatus(@PathVariable Long id, @RequestBody BkStatus status) {
        return ResponseEntity.ok(masterDataService.updateStatus(id, status));
    }

    @DeleteMapping("/statuses/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable Long id) {
        masterDataService.deleteStatus(id);
        return ResponseEntity.noContent().build();
    }

    // ── Types ─────────────────────────────────────────────────────────────────

    @GetMapping("/types")
    public List<BkType> getTypes() {
        return masterDataService.getAllTypes();
    }

    @PostMapping("/types")
    public ResponseEntity<BkType> createType(@RequestBody BkType type) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.saveType(type));
    }

    @PutMapping("/types/{id}")
    public ResponseEntity<BkType> updateType(@PathVariable Long id, @RequestBody BkType type) {
        return ResponseEntity.ok(masterDataService.updateType(id, type));
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<Void> deleteType(@PathVariable Long id) {
        masterDataService.deleteType(id);
        return ResponseEntity.noContent().build();
    }

    // ── Conditions ────────────────────────────────────────────────────────────

    @GetMapping("/conditions")
    public List<BkCondition> getConditions(
            @RequestParam(required = false) String bookingTypeCode) {
        return masterDataService.getConditions(bookingTypeCode);
    }

    @PostMapping("/conditions")
    public ResponseEntity<BkCondition> createCondition(@RequestBody BkCondition condition) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.saveCondition(condition));
    }

    @PutMapping("/conditions/{id}")
    public ResponseEntity<BkCondition> updateCondition(@PathVariable Long id,
                                                        @RequestBody BkCondition condition) {
        return ResponseEntity.ok(masterDataService.updateCondition(id, condition));
    }

    @DeleteMapping("/conditions/{id}")
    public ResponseEntity<Void> deleteCondition(@PathVariable Long id) {
        masterDataService.deleteCondition(id);
        return ResponseEntity.noContent().build();
    }

    // ── Terms & Conditions ────────────────────────────────────────────────────

    @GetMapping("/terms")
    public List<BkTerms> getTerms(@RequestParam(required = false) String bookingTypeCode) {
        return masterDataService.getTerms(bookingTypeCode);
    }

    @GetMapping("/terms/current")
    public ResponseEntity<BkTerms> getCurrentTerms(@RequestParam String bookingTypeCode) {
        Optional<BkTerms> terms = masterDataService.getCurrentTerms(bookingTypeCode);
        return terms.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/terms")
    public ResponseEntity<BkTerms> createTerms(@RequestBody BkTerms terms) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.saveTerms(terms));
    }

    @PutMapping("/terms/{id}")
    public ResponseEntity<BkTerms> updateTerms(@PathVariable Long id, @RequestBody BkTerms terms) {
        return ResponseEntity.ok(masterDataService.updateTerms(id, terms));
    }

    @PatchMapping("/terms/{id}/activate")
    public ResponseEntity<BkTerms> activateTerms(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.activateTerms(id));
    }

    @DeleteMapping("/terms/{id}")
    public ResponseEntity<Void> deleteTerms(@PathVariable Long id) {
        masterDataService.deleteTerms(id);
        return ResponseEntity.noContent().build();
    }

    // ── Availability Config ───────────────────────────────────────────────────

    @GetMapping("/availability")
    public List<BkAvailabilityConfig> getAvailabilityConfigs(
            @RequestParam(required = false) String bookingTypeCode) {
        return masterDataService.getAvailabilityConfigs(bookingTypeCode);
    }

    @PostMapping("/availability")
    public ResponseEntity<BkAvailabilityConfig> createAvailabilityConfig(
            @RequestBody BkAvailabilityConfig config) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(masterDataService.saveAvailabilityConfig(config));
    }

    @PutMapping("/availability/{id}")
    public ResponseEntity<BkAvailabilityConfig> updateAvailabilityConfig(
            @PathVariable Long id, @RequestBody BkAvailabilityConfig config) {
        return ResponseEntity.ok(masterDataService.updateAvailabilityConfig(id, config));
    }

    @DeleteMapping("/availability/{id}")
    public ResponseEntity<Void> deleteAvailabilityConfig(@PathVariable Long id) {
        masterDataService.deleteAvailabilityConfig(id);
        return ResponseEntity.noContent().build();
    }
}
