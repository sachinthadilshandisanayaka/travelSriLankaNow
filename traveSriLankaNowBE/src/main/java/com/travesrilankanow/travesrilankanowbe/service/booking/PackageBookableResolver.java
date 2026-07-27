package com.travesrilankanow.travesrilankanowbe.service.booking;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import com.travesrilankanow.travesrilankanowbe.entity.TourPackage;
import com.travesrilankanow.travesrilankanowbe.repository.EventBookingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PackageBookableResolver implements BookableEntityResolver {

    private final PackageRepository packageRepository;
    private final EventBookingRepository bookingRepository;

    @Override
    public String getBookingTypeCode() {
        return EventBooking.BookingTypes.PACKAGE;
    }

    @Override
    public String getDisplayTypeLabel() {
        return "Day Tour";
    }

    @Override
    public Long getEntityId(EventBooking booking) {
        return booking.getPackageId();
    }

    @Override
    public String resolveTitle(Long entityId) {
        if (entityId == null) return "Unknown Package";
        return packageRepository.findById(entityId).map(TourPackage::getTitle).orElse("Unknown Package");
    }

    @Override
    public long countActiveByDate(Long entityId, LocalDate date, EventBooking.BookingStatus cancelledStatus) {
        return bookingRepository.countActiveByTypeAndPackageAndDate(getBookingTypeCode(), entityId, date, cancelledStatus);
    }

    @Override
    public List<Object[]> countByDateRange(Long entityId, LocalDate from, LocalDate to, EventBooking.BookingStatus cancelledStatus) {
        return bookingRepository.countByTypeAndPackageAndDateRange(getBookingTypeCode(), entityId, from, to, cancelledStatus);
    }
}
