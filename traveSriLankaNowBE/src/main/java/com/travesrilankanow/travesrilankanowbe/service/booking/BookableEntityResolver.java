package com.travesrilankanow.travesrilankanowbe.service.booking;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;

import java.time.LocalDate;
import java.util.List;

/**
 * One implementation per bookable content type (Event, Place, Package, and any
 * future tour type). EventBookingService and CustomerController resolve titles,
 * availability, and blocked-dates purely through this interface (via
 * BookableEntityResolverRegistry) instead of hardcoded per-type branches — a new
 * bookable content type is added by writing one new @Component implementation,
 * not by editing every method that currently branches on booking type.
 */
public interface BookableEntityResolver {

    /** Matches EventBooking.BookingTypes.* and bk_types.code in the database. */
    String getBookingTypeCode();

    /** Human-readable label for admin/customer UIs, e.g. "Day Tour", "Long Tour". */
    String getDisplayTypeLabel();

    /** Reads whichever FK column on the booking corresponds to this type. */
    Long getEntityId(EventBooking booking);

    /** Looks up the entity's display name; a stable "Unknown X" fallback if missing. */
    String resolveTitle(Long entityId);

    long countActiveByDate(Long entityId, LocalDate date, EventBooking.BookingStatus cancelledStatus);

    List<Object[]> countByDateRange(Long entityId, LocalDate from, LocalDate to, EventBooking.BookingStatus cancelledStatus);
}
