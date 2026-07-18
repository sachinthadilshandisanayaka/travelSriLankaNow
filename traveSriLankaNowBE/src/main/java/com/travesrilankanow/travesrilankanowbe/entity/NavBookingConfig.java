package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Maps a nav_config item to a booking type and stores all booking-behaviour
 * conditions that apply when a user books from that nav section.
 *
 * One nav item can have multiple rules (e.g., Events tab offers both EVENT and
 * ACTIVITY booking types). Each rule is independent.
 */
@Entity
@Table(
    name = "nav_booking_config",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_nav_bk_config",
        columnNames = {"nav_config_id", "bk_type_code"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NavBookingConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Link to nav item ────────────────────────────────────────────────────

    @Column(name = "nav_config_id", nullable = false)
    private Long navConfigId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nav_config_id", insertable = false, updatable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private NavConfig navConfig;

    // ── Link to booking type ────────────────────────────────────────────────

    @Column(name = "bk_type_code", nullable = false, length = 50)
    private String bookingTypeCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bk_type_code", referencedColumnName = "code", insertable = false, updatable = false)
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private BkType bookingType;

    // ── Date selection mode ─────────────────────────────────────────────────

    /**
     * NONE  – no date selection needed (open voucher, gift package)
     * SINGLE – customer picks a single visit date (day tour, activity, event)
     * RANGE  – customer picks check-in and check-out (accommodation, multi-day tour)
     * MULTI  – customer picks multiple discrete dates (recurring class, spa sessions)
     */
    @Column(name = "date_mode", nullable = false, length = 20)
    @Builder.Default
    private String dateMode = "SINGLE";

    // ── Advance booking window ──────────────────────────────────────────────

    /** Minimum days from today the selected date must be (0 = same-day OK). */
    @Column(name = "min_lead_days")
    @Builder.Default
    private Integer minLeadDays = 0;

    /** Maximum days ahead a booking can be placed (null = no ceiling). */
    @Column(name = "max_advance_days")
    private Integer maxAdvanceDays;

    // ── Stay duration (RANGE mode) ──────────────────────────────────────────

    /** Minimum nights/days for a range booking (null = no minimum). */
    @Column(name = "min_stay_days")
    private Integer minStayDays;

    /** Maximum nights/days for a range booking (null = no maximum). */
    @Column(name = "max_stay_days")
    private Integer maxStayDays;

    // ── Party / group size ──────────────────────────────────────────────────

    /** Minimum participants per booking (default 1). */
    @Column(name = "min_party")
    @Builder.Default
    private Integer minParty = 1;

    /** Maximum participants per booking (null = unlimited). */
    @Column(name = "max_party")
    private Integer maxParty;

    // ── Auth requirement ────────────────────────────────────────────────────

    /** When true, the customer must be authenticated to complete a booking. */
    @Column(name = "require_auth")
    @Builder.Default
    private Boolean requireAuth = false;

    // ── Day-of-week restriction ─────────────────────────────────────────────

    /**
     * Bitmask of allowed days: bit 0 = Mon, bit 1 = Tue … bit 6 = Sun.
     * null = all days allowed.
     * Example: Mon+Wed+Fri only = 0b0010101 = 21
     */
    @Column(name = "allowed_dow")
    private Integer allowedDow;

    // ── Seasonal booking window ─────────────────────────────────────────────

    /** First calendar date on which bookings may be placed (null = no restriction). */
    @Column(name = "booking_open_from")
    private LocalDate bookingOpenFrom;

    /** Last calendar date on which bookings may be placed (null = no restriction). */
    @Column(name = "booking_open_to")
    private LocalDate bookingOpenTo;

    // ── Future-proof extension ──────────────────────────────────────────────

    /** JSON blob for conditions not yet promoted to first-class columns. */
    @Column(name = "extra_config", columnDefinition = "TEXT")
    private String extraConfig;

    // ── State ───────────────────────────────────────────────────────────────

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // ── Static blocked dates ────────────────────────────────────────────────

    @OneToMany(mappedBy = "navBookingConfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude @EqualsAndHashCode.Exclude
    private List<BkBlackoutDate> blackoutDates = new ArrayList<>();

    // ── Audit ───────────────────────────────────────────────────────────────

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (dateMode  == null) dateMode  = "SINGLE";
        if (minLeadDays == null) minLeadDays = 0;
        if (minParty  == null) minParty  = 1;
        if (requireAuth == null) requireAuth = false;
        if (isActive  == null) isActive  = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
