package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class BookingSpecification {

    public static Specification<EventBooking> withFilters(
            EventBooking.BookingStatus status,
            String search,
            String reference,
            LocalDate dateFrom,
            LocalDate dateTo) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("participantName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern)
                ));
            }

            if (reference != null && !reference.isBlank()) {
                String pattern = "%" + reference.toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("bookingReference")), pattern));
            }

            // Filter by the "effective visit date": requestedDate when set, bookingDate otherwise.
            // This matches the "Visit Date" column displayed in the admin table.
            if (dateFrom != null || dateTo != null) {
                List<Predicate> withReqParts = new ArrayList<>();
                List<Predicate> withoutReqParts = new ArrayList<>();

                if (dateFrom != null) {
                    withReqParts.add(cb.greaterThanOrEqualTo(root.get("requestedDate"), dateFrom));
                    withoutReqParts.add(cb.greaterThanOrEqualTo(root.get("bookingDate"), dateFrom.atStartOfDay()));
                }
                if (dateTo != null) {
                    withReqParts.add(cb.lessThanOrEqualTo(root.get("requestedDate"), dateTo));
                    withoutReqParts.add(cb.lessThanOrEqualTo(root.get("bookingDate"), dateTo.atTime(23, 59, 59)));
                }

                Predicate hasRequested = cb.isNotNull(root.get("requestedDate"));
                Predicate matchByRequestedDate = cb.and(hasRequested, cb.and(withReqParts.toArray(new Predicate[0])));
                Predicate matchByBookingDate   = cb.and(cb.isNull(root.get("requestedDate")), cb.and(withoutReqParts.toArray(new Predicate[0])));

                predicates.add(cb.or(matchByRequestedDate, matchByBookingDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
