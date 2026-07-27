package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.*;
import com.travesrilankanow.travesrilankanowbe.entity.BkAvailabilityConfig;
import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.EventDate;
import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.entity.PackageDate;
import com.travesrilankanow.travesrilankanowbe.entity.TourPackage;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.*;
import com.travesrilankanow.travesrilankanowbe.service.booking.BookableEntityResolver;
import com.travesrilankanow.travesrilankanowbe.service.booking.BookableEntityResolverRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventBookingService {

    private final EventBookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final EventDateRepository eventDateRepository;
    private final UserRepository userRepository;
    private final PlaceRepository placeRepository;
    private final PackageRepository packageRepository;
    private final PackageDateRepository packageDateRepository;
    private final BookingConditionEngine conditionEngine;
    private final BookingAuditService auditService;
    private final BkAvailabilityConfigRepository availabilityRepo;
    private final NavBookingConfigService navBookingConfigService;
    private final EmailService emailService;
    private final SystemEmailConfigService systemEmailConfigService;
    private final BookableEntityResolverRegistry resolverRegistry;

    @Transactional
    public EventBooking bookEvent(EventBookingDTO dto, String currentUsername) {
        Event event = eventRepository.findById(dto.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found: " + dto.getEventId()));

        // Resolve requestedDate before availability check
        LocalDate requestedDate = dto.getRequestedDate();
        if (requestedDate == null && dto.getPreferredDate() != null && !dto.getPreferredDate().isBlank()) {
            try { requestedDate = LocalDate.parse(dto.getPreferredDate()); } catch (Exception ignored) {}
        }

        checkAvailability(EventBooking.BookingTypes.EVENT, dto.getEventId(), requestedDate);

        // For RANGE mode, use checkInDate as the primary date
        if (requestedDate == null && dto.getCheckInDate() != null) {
            requestedDate = dto.getCheckInDate();
        }

        // Validate against nav-item booking rules (lead time, party size, blackouts, etc.)
        navBookingConfigService.validateBooking(
                dto.getNavRoutePath(), requestedDate, dto.getCheckOutDate(),
                dto.getNumberOfPeople(), currentUsername != null);

        if (dto.getEventDateId() != null) {
            EventDate eventDate = eventDateRepository.findById(dto.getEventDateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event date not found: " + dto.getEventDateId()));
            if (eventDate.getAvailableSpots() < dto.getNumberOfPeople()) {
                throw new IllegalStateException("Not enough spots available for this date");
            }
            eventDate.setAvailableSpots(eventDate.getAvailableSpots() - dto.getNumberOfPeople());
            eventDateRepository.save(eventDate);
        }

        EventBooking booking = new EventBooking();
        booking.setBookingType(EventBooking.BookingTypes.EVENT);
        booking.setEventId(dto.getEventId());
        booking.setEventDateId(dto.getEventDateId());
        booking.setParticipantName(dto.getParticipantName());
        booking.setEmail(dto.getEmail());
        booking.setPhone(dto.getPhone());
        booking.setNumberOfPeople(dto.getNumberOfPeople());
        booking.setTotalPrice(dto.getTotalPrice());
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(EventBooking.BookingStatus.pending);
        booking.setPaymentStatus(EventBooking.PaymentStatus.UNPAID);
        booking.setTermsAccepted(Boolean.TRUE.equals(dto.getTermsAccepted()));
        booking.setRequestedDate(requestedDate);
        booking.setCheckInDate(dto.getCheckInDate());
        booking.setCheckOutDate(dto.getCheckOutDate());

        // Append any free-text notes to specialRequests
        String notes = dto.getSpecialRequests() != null ? dto.getSpecialRequests() : "";
        booking.setSpecialRequests(notes.isBlank() ? null : notes);

        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername)
                    .ifPresent(user -> {
                        booking.setCustomerId(user.getId());
                        booking.setCreatedBy(user.getUsername());
                    });
        }

        EventBooking saved = bookingRepository.save(booking);
        saved.setBookingReference(buildRef(saved.getId()));
        saved = bookingRepository.save(saved);
        auditService.logCreated(saved, currentUsername);
        sendBookingConfirmationEmails(saved, event.getTitle());
        return saved;
    }

    @Transactional
    public EventBooking bookPlace(Long placeId, PlaceBookingRequest req, String currentUsername) {
        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found: " + placeId));

        StringBuilder notes = new StringBuilder();
        if (req.getMessage() != null && !req.getMessage().isBlank()) notes.append(req.getMessage());
        if (req.getCheckInDate() != null && !req.getCheckInDate().isBlank())
            notes.append("\nCheck-in: ").append(req.getCheckInDate());
        if (req.getCheckOutDate() != null && !req.getCheckOutDate().isBlank())
            notes.append("\nCheck-out: ").append(req.getCheckOutDate());
        if (req.getVisitDate() != null && !req.getVisitDate().isBlank())
            notes.append("\nVisit date: ").append(req.getVisitDate());
        if (req.getPreferredTime() != null && !req.getPreferredTime().isBlank())
            notes.append("\nPreferred time: ").append(req.getPreferredTime());

        // Resolve requestedDate from the visit/check-in date fields
        LocalDate requestedDate = null;
        if (req.getVisitDate() != null && !req.getVisitDate().isBlank()) {
            try { requestedDate = LocalDate.parse(req.getVisitDate()); } catch (Exception ignored) {}
        }
        if (requestedDate == null && req.getCheckInDate() != null && !req.getCheckInDate().isBlank()) {
            try { requestedDate = LocalDate.parse(req.getCheckInDate()); } catch (Exception ignored) {}
        }

        checkAvailability(EventBooking.BookingTypes.PLACE, placeId, requestedDate);

        // Resolve end date for RANGE-mode validation
        LocalDate endDate = null;
        if (req.getCheckOutDate() != null && !req.getCheckOutDate().isBlank()) {
            try { endDate = LocalDate.parse(req.getCheckOutDate()); } catch (Exception ignored) {}
        }

        // Validate against nav-item booking rules
        navBookingConfigService.validateBooking(
                req.getNavRoutePath(), requestedDate, endDate,
                req.getPartySize(), currentUsername != null);

        EventBooking booking = new EventBooking();
        booking.setBookingType(EventBooking.BookingTypes.PLACE);
        booking.setPlaceId(placeId);
        booking.setParticipantName(req.getVisitorName());
        booking.setEmail(req.getEmail());
        booking.setPhone(req.getPhone() != null ? req.getPhone() : "");
        booking.setNumberOfPeople(req.getPartySize() != null ? req.getPartySize() : 1);
        booking.setSpecialRequests(notes.toString());
        booking.setTotalPrice(0.0);
        booking.setBookingDate(LocalDateTime.now());
        booking.setRequestedDate(requestedDate);
        booking.setStatus(EventBooking.BookingStatus.pending);
        booking.setPaymentStatus(EventBooking.PaymentStatus.UNPAID);

        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername)
                    .ifPresent(user -> {
                        booking.setCustomerId(user.getId());
                        booking.setCreatedBy(user.getUsername());
                    });
        }

        EventBooking saved = bookingRepository.save(booking);
        saved.setBookingReference(buildRef(saved.getId()));
        saved = bookingRepository.save(saved);
        auditService.logCreated(saved, currentUsername);
        sendBookingConfirmationEmails(saved, place.getName());
        return saved;
    }

    @Transactional
    public EventBooking bookPackage(Long packageId, PackageBookingRequest req, String currentUsername) {
        TourPackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found: " + packageId));

        // Resolve requestedDate before availability check
        LocalDate requestedDate = null;
        if (req.getPreferredDate() != null && !req.getPreferredDate().isBlank()) {
            try { requestedDate = LocalDate.parse(req.getPreferredDate()); } catch (Exception ignored) {}
        }

        checkAvailability(EventBooking.BookingTypes.PACKAGE, packageId, requestedDate);

        LocalDate checkIn = null;
        LocalDate checkOut = null;
        if (req.getCheckInDate() != null && !req.getCheckInDate().isBlank()) {
            try { checkIn = LocalDate.parse(req.getCheckInDate()); } catch (Exception ignored) {}
        }
        if (req.getCheckOutDate() != null && !req.getCheckOutDate().isBlank()) {
            try { checkOut = LocalDate.parse(req.getCheckOutDate()); } catch (Exception ignored) {}
        }
        if (requestedDate == null && checkIn != null) {
            requestedDate = checkIn;
        }

        // Validate against nav-item booking rules (lead time, party size, blackouts, etc.)
        navBookingConfigService.validateBooking(
                req.getNavRoutePath(), requestedDate, checkOut,
                req.getNumberOfPeople(), currentUsername != null);

        if (req.getPackageDateId() != null) {
            PackageDate packageDate = packageDateRepository.findById(req.getPackageDateId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package date not found: " + req.getPackageDateId()));
            int requested = req.getNumberOfPeople() != null ? req.getNumberOfPeople() : 1;
            if (packageDate.getAvailableSpots() < requested) {
                throw new IllegalStateException("Not enough spots available for this date");
            }
            packageDate.setAvailableSpots(packageDate.getAvailableSpots() - requested);
            packageDateRepository.save(packageDate);
        }

        EventBooking booking = new EventBooking();
        booking.setBookingType(EventBooking.BookingTypes.PACKAGE);
        booking.setPackageId(packageId);
        booking.setParticipantName(req.getParticipantName());
        booking.setEmail(req.getEmail());
        booking.setPhone(req.getPhone() != null ? req.getPhone() : "");
        booking.setNumberOfPeople(req.getNumberOfPeople() != null ? req.getNumberOfPeople() : 1);
        booking.setSpecialRequests(req.getSpecialRequests());
        booking.setTotalPrice(req.getTotalPrice() != null ? req.getTotalPrice() : 0.0);
        booking.setBookingDate(LocalDateTime.now());
        booking.setRequestedDate(requestedDate);
        booking.setCheckInDate(checkIn);
        booking.setCheckOutDate(checkOut);
        booking.setStatus(EventBooking.BookingStatus.pending);
        booking.setPaymentStatus(EventBooking.PaymentStatus.UNPAID);

        if (currentUsername != null) {
            userRepository.findByUsername(currentUsername)
                    .ifPresent(user -> {
                        booking.setCustomerId(user.getId());
                        booking.setCreatedBy(user.getUsername());
                    });
        }

        EventBooking saved = bookingRepository.save(booking);
        saved.setBookingReference(buildRef(saved.getId()));
        saved = bookingRepository.save(saved);
        auditService.logCreated(saved, currentUsername);
        sendBookingConfirmationEmails(saved, pkg.getTitle());
        return saved;
    }

    public List<EventBooking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public EventBooking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    public List<EventBooking> getBookingsByEmail(String email) {
        return bookingRepository.findByEmail(email);
    }

    public List<EventBooking> getBookingsByEventId(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }

    @Transactional
    public EventBooking updateBookingStatus(Long id, EventBooking.BookingStatus newStatus, String changedBy) {
        EventBooking booking = getBookingById(id);
        EventBooking.BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(newStatus);
        if (changedBy != null) booking.setUpdatedBy(changedBy);
        EventBooking saved = bookingRepository.save(booking);
        auditService.logStatusChange(saved.getId(), oldStatus.name(), newStatus.name(), changedBy, null);

        // Only notify the customer on an actual transition, and only for the
        // two status changes that matter to them — not e.g. confirmed -> completed.
        if (newStatus != oldStatus) {
            if (newStatus == EventBooking.BookingStatus.confirmed) {
                sendBookingStatusChangeEmail(saved, EmailTemplateKeys.BOOKING_CONFIRMED_CUSTOMER);
            } else if (newStatus == EventBooking.BookingStatus.cancelled) {
                sendBookingStatusChangeEmail(saved, EmailTemplateKeys.BOOKING_CANCELLED_CUSTOMER);
            }
        }
        return saved;
    }

    /** Customer-facing: cancel with condition validation */
    @Transactional
    public EventBooking cancelBooking(Long id, String reason, String username) {
        EventBooking booking = getBookingById(id);

        if (!conditionEngine.canCancel(booking)) {
            String msg = conditionEngine.getCancelViolationReason(booking);
            throw new IllegalStateException(msg != null ? msg : "Cancellation not allowed at this time");
        }

        String oldStatus = booking.getStatus().name();
        booking.setStatus(EventBooking.BookingStatus.cancelled);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedBy(username);
        EventBooking saved = bookingRepository.save(booking);
        auditService.logCancelled(saved.getId(), oldStatus, username, reason);
        return saved;
    }

    /** Customer-facing: edit booking details with condition validation */
    @Transactional
    public EventBooking editBooking(Long id, BookingEditRequest req, String username) {
        EventBooking booking = getBookingById(id);

        if (!conditionEngine.canEdit(booking)) {
            String msg = conditionEngine.getEditViolationReason(booking);
            throw new IllegalStateException(msg != null ? msg : "Editing not allowed at this time");
        }

        if (req.getParticipantName() != null && !req.getParticipantName().isBlank())
            booking.setParticipantName(req.getParticipantName());
        if (req.getPhone() != null && !req.getPhone().isBlank())
            booking.setPhone(req.getPhone());
        if (req.getNumberOfPeople() != null)
            booking.setNumberOfPeople(req.getNumberOfPeople());
        if (req.getSpecialRequests() != null)
            booking.setSpecialRequests(req.getSpecialRequests());
        if (req.getRequestedDate() != null)
            booking.setRequestedDate(req.getRequestedDate());
        if (Boolean.TRUE.equals(req.getTermsAccepted()))
            booking.setTermsAccepted(true);

        booking.setEditedAt(LocalDateTime.now());
        booking.setUpdatedBy(username);
        EventBooking saved = bookingRepository.save(booking);
        auditService.logEdited(saved.getId(), username);
        return saved;
    }

    public BookingConditionCheckResponse checkConditions(Long id) {
        EventBooking booking = getBookingById(id);
        boolean canCancel = conditionEngine.canCancel(booking);
        boolean canEdit = conditionEngine.canEdit(booking);
        return new BookingConditionCheckResponse(
                canCancel, conditionEngine.getCancelViolationReason(booking),
                canEdit,   conditionEngine.getEditViolationReason(booking));
    }

    // ===== Admin methods =====

    public Page<BookingAdminResponse> getAdminBookings(
            EventBooking.BookingStatus status,
            String search,
            String reference,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable) {
        boolean hasFilters = status != null
                || (search != null && !search.isBlank())
                || (reference != null && !reference.isBlank())
                || dateFrom != null || dateTo != null;

        Page<EventBooking> page;
        if (hasFilters) {
            var spec = BookingSpecification.withFilters(status, search, reference, dateFrom, dateTo);
            page = bookingRepository.findAll(spec, pageable);
        } else {
            page = bookingRepository.findAllByOrderByBookingDateDesc(pageable);
        }

        List<BookingAdminResponse> content = enrichBookings(page.getContent());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    public BookingAdminResponse getAdminBooking(Long id) {
        EventBooking b = getBookingById(id);
        BookableEntityResolver resolver = resolverRegistry.get(b.getBookingType());
        String title = resolver.resolveTitle(resolver.getEntityId(b));
        return BookingAdminResponse.from(b, title, resolver.getDisplayTypeLabel());
    }

    public List<BookingCalendarDay> getBookingCalendar(int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDateTime from = ym.atDay(1).atStartOfDay();
        LocalDateTime to = ym.atEndOfMonth().atTime(23, 59, 59);

        List<EventBooking> bookings = bookingRepository.findByBookingDateBetweenOrRequestedDateBetween(
                from, to, ym.atDay(1), ym.atEndOfMonth());

        // Group by requestedDate when available; fall back to bookingDate
        Map<String, List<EventBooking>> byDate = bookings.stream()
                .collect(Collectors.groupingBy(b -> {
                    if (b.getRequestedDate() != null) return b.getRequestedDate().toString();
                    return b.getBookingDate().toLocalDate().toString();
                }));

        Map<String, Map<Long, String>> titleCache = buildTitleCache(bookings);

        List<BookingCalendarDay> result = new ArrayList<>();
        for (int d = 1; d <= ym.lengthOfMonth(); d++) {
            LocalDate date = ym.atDay(d);
            List<EventBooking> dayBookings = byDate.getOrDefault(date.toString(), List.of());
            long pending   = dayBookings.stream().filter(b -> b.getStatus() == EventBooking.BookingStatus.pending).count();
            long confirmed = dayBookings.stream().filter(b -> b.getStatus() == EventBooking.BookingStatus.confirmed).count();
            long completed = dayBookings.stream().filter(b -> b.getStatus() == EventBooking.BookingStatus.completed).count();
            List<BookingAdminResponse> enriched = dayBookings.stream()
                    .map(b -> toAdminResponse(b, titleCache))
                    .collect(Collectors.toList());
            result.add(new BookingCalendarDay(date, dayBookings.size(), pending, confirmed, completed, enriched));
        }
        return result;
    }

    /** Single-item title resolution (no caching needed) — used by CustomerController for one booking at a time. */
    public String resolveTitle(EventBooking b) {
        BookableEntityResolver resolver = resolverRegistry.get(b.getBookingType());
        return resolver.resolveTitle(resolver.getEntityId(b));
    }

    /** Batches title lookups per (bookingType, entityId) pair so repeated entities across many bookings are resolved once. */
    private Map<String, Map<Long, String>> buildTitleCache(List<EventBooking> bookings) {
        Map<String, Map<Long, String>> cache = new HashMap<>();
        for (EventBooking b : bookings) {
            BookableEntityResolver resolver = resolverRegistry.get(b.getBookingType());
            Long entityId = resolver.getEntityId(b);
            cache.computeIfAbsent(b.getBookingType(), k -> new HashMap<>())
                    .computeIfAbsent(entityId, resolver::resolveTitle);
        }
        return cache;
    }

    private BookingAdminResponse toAdminResponse(EventBooking b, Map<String, Map<Long, String>> titleCache) {
        BookableEntityResolver resolver = resolverRegistry.get(b.getBookingType());
        Long entityId = resolver.getEntityId(b);
        String title = titleCache.getOrDefault(b.getBookingType(), Map.of())
                .getOrDefault(entityId, resolver.resolveTitle(entityId));
        return BookingAdminResponse.from(b, title, resolver.getDisplayTypeLabel());
    }

    /** Public — also used by CustomerController for the customer's own booking list. */
    public List<BookingAdminResponse> enrichBookings(List<EventBooking> bookings) {
        Map<String, Map<Long, String>> titleCache = buildTitleCache(bookings);
        return bookings.stream()
                .map(b -> toAdminResponse(b, titleCache))
                .collect(Collectors.toList());
    }

    /**
     * Returns ISO date strings (yyyy-MM-dd) that are fully booked or blacked-out for a given month.
     * Merges capacity-based blocked dates (BkAvailabilityConfig) with static admin blackout dates
     * (NavBookingConfig.blackoutDates) so the frontend calendar shows the complete picture.
     *
     * @param routePath optional nav route path — used to include nav-level blackout dates
     */
    public List<String> getBlockedDates(String bookingType, Long entityId, int year, int month,
                                        String routePath) {
        // Static blackout dates from NavBookingConfig for this route
        List<String> blackouts = routePath != null && !routePath.isBlank()
                ? navBookingConfigService.getBlackoutDatesForMonth(routePath, year, month)
                        .stream().map(LocalDate::toString).toList()
                : List.of();

        Optional<BkAvailabilityConfig> cfgOpt = entityId != null
                ? availabilityRepo.findByBookingTypeCodeAndEntityIdAndActiveTrue(bookingType, entityId)
                : Optional.empty();
        if (cfgOpt.isEmpty()) {
            cfgOpt = availabilityRepo.findByBookingTypeCodeAndEntityIdIsNullAndActiveTrue(bookingType);
        }
        if (cfgOpt.isEmpty()) return blackouts;

        BkAvailabilityConfig cfg = cfgOpt.get();
        YearMonth ym = YearMonth.of(year, month);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        List<Object[]> rows;
        if (entityId != null) {
            rows = resolverRegistry.get(bookingType).countByDateRange(entityId, from, to, EventBooking.BookingStatus.cancelled);
        } else {
            rows = bookingRepository.countByTypeAndDateRange(bookingType, from, to, EventBooking.BookingStatus.cancelled);
        }

        List<String> capacityBlocked = rows.stream()
                .filter(row -> {
                    long count = ((Number) row[1]).longValue();
                    if (cfg.getMaxBookingsPerDate() != null) {
                        return count >= cfg.getMaxBookingsPerDate();
                    }
                    return !cfg.isAllowMultiplePerDate() && count > 0;
                })
                .map(row -> row[0].toString())
                .collect(Collectors.toList());

        // Merge capacity-blocked and blackout dates, deduplicate, sort
        return java.util.stream.Stream.concat(capacityBlocked.stream(), blackouts.stream())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    /**
     * Enforces BkAvailabilityConfig rules for the given booking type + entity + date.
     * Entity-specific config takes priority over global (entityId = null) config.
     * Throws IllegalStateException when a limit would be exceeded.
     */
    private void checkAvailability(String bookingType, Long entityId, LocalDate requestedDate) {
        if (requestedDate == null) return;

        // Entity-specific config first, then fall back to global
        java.util.Optional<BkAvailabilityConfig> configOpt = entityId != null
                ? availabilityRepo.findByBookingTypeCodeAndEntityIdAndActiveTrue(bookingType, entityId)
                : java.util.Optional.empty();
        if (configOpt.isEmpty()) {
            configOpt = availabilityRepo.findByBookingTypeCodeAndEntityIdIsNullAndActiveTrue(bookingType);
        }
        if (configOpt.isEmpty()) return; // no rule configured → allow

        BkAvailabilityConfig cfg = configOpt.get();

        long existing;
        if (entityId != null) {
            existing = resolverRegistry.get(bookingType).countActiveByDate(entityId, requestedDate, EventBooking.BookingStatus.cancelled);
        } else {
            existing = bookingRepository.countActiveByTypeAndDate(bookingType, requestedDate, EventBooking.BookingStatus.cancelled);
        }

        // maxBookingsPerDate takes priority: if it is set, use it as the sole limit.
        // allowMultiplePerDate=false is only enforced when no explicit max is configured.
        if (cfg.getMaxBookingsPerDate() != null) {
            if (existing >= cfg.getMaxBookingsPerDate()) {
                throw new IllegalStateException(
                        "Maximum bookings (" + cfg.getMaxBookingsPerDate() + ") already reached for " + requestedDate);
            }
        } else if (!cfg.isAllowMultiplePerDate()) {
            if (existing > 0) {
                throw new IllegalStateException(
                        "No additional bookings are allowed on " + requestedDate + " — only one booking per date is permitted for this " + bookingType.toLowerCase());
            }
        }
    }

    private String buildRef(Long id) {
        return "TSL-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"))
                + "-" + String.format("%04d", id);
    }

    /**
     * Fires the customer + owner confirmation emails for a newly-created booking.
     * EmailService.sendTemplatedEmail is @Async and catches every exception itself,
     * so this never affects the booking transaction/response even if SMTP is down.
     * The context map is built entirely from the in-memory `booking` object (not
     * re-queried) since the async send may run before this transaction commits.
     */
    private void sendBookingConfirmationEmails(EventBooking booking, String itemTitle) {
        Map<String, Object> ctx = buildEmailContext(booking, itemTitle);

        emailService.sendTemplatedEmail(EmailTemplateKeys.BOOKING_CONFIRMATION_CUSTOMER, booking.getEmail(), ctx);

        String ownerEmail = systemEmailConfigService.getConfig().getOwnerNotificationEmail();
        if (ownerEmail != null && !ownerEmail.isBlank()) {
            emailService.sendTemplatedEmail(EmailTemplateKeys.BOOKING_CONFIRMATION_OWNER, ownerEmail, ctx);
        }
    }

    /**
     * Fires the customer-facing status-change email (confirmed/cancelled) when
     * an admin changes a booking's status. Resolves the item title fresh here
     * since, unlike booking creation, the caller (updateBookingStatus) doesn't
     * already have it in scope.
     */
    private void sendBookingStatusChangeEmail(EventBooking booking, String templateKey) {
        BookableEntityResolver resolver = resolverRegistry.get(booking.getBookingType());
        String itemTitle = resolver.resolveTitle(resolver.getEntityId(booking));
        emailService.sendTemplatedEmail(templateKey, booking.getEmail(), buildEmailContext(booking, itemTitle));
    }

    private Map<String, Object> buildEmailContext(EventBooking booking, String itemTitle) {
        Map<String, Object> ctx = new java.util.HashMap<>();
        ctx.put("bookingReference", booking.getBookingReference());
        ctx.put("itemTitle", itemTitle);
        ctx.put("participantName", booking.getParticipantName());
        ctx.put("numberOfPeople", booking.getNumberOfPeople());
        ctx.put("totalPrice", booking.getTotalPrice());
        ctx.put("requestedDate", booking.getRequestedDate() != null ? booking.getRequestedDate().toString() : "");
        ctx.put("checkInDate", booking.getCheckInDate() != null ? booking.getCheckInDate().toString() : "");
        ctx.put("checkOutDate", booking.getCheckOutDate() != null ? booking.getCheckOutDate().toString() : "");
        ctx.put("phone", booking.getPhone());
        ctx.put("email", booking.getEmail());
        ctx.put("cancellationReason", booking.getCancellationReason() != null ? booking.getCancellationReason() : "Not specified");
        return ctx;
    }
}
