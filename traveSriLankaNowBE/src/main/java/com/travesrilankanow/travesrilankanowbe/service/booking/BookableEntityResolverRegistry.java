package com.travesrilankanow.travesrilankanowbe.service.booking;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Collects every BookableEntityResolver bean and looks them up by booking-type
 * code. Spring auto-wires all implementations here — a new resolver @Component
 * registers itself automatically, no changes needed to this class.
 */
@Component
public class BookableEntityResolverRegistry {

    private final Map<String, BookableEntityResolver> resolversByType;

    public BookableEntityResolverRegistry(List<BookableEntityResolver> resolvers) {
        this.resolversByType = resolvers.stream()
                .collect(Collectors.toMap(BookableEntityResolver::getBookingTypeCode, r -> r));
    }

    public BookableEntityResolver get(String bookingType) {
        BookableEntityResolver resolver = resolversByType.get(bookingType);
        if (resolver == null) {
            throw new IllegalStateException("No BookableEntityResolver registered for booking type: " + bookingType);
        }
        return resolver;
    }
}
