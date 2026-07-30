package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventBookingRepository extends JpaRepository<EventBooking, Long>, JpaSpecificationExecutor<EventBooking> {

    List<EventBooking> findByEmail(String email);

    List<EventBooking> findByEventId(Long eventId);

    List<EventBooking> findByCustomerIdOrderByBookingDateDesc(Long customerId);

    java.util.Optional<EventBooking> findByBookingReference(String bookingReference);

    List<EventBooking> findByStatusOrderByBookingDateDesc(EventBooking.BookingStatus status);

    Page<EventBooking> findAllByOrderByBookingDateDesc(Pageable pageable);

    Page<EventBooking> findByStatusOrderByBookingDateDesc(EventBooking.BookingStatus status, Pageable pageable);

    @Query("SELECT b FROM EventBooking b WHERE b.bookingDate BETWEEN :from AND :to ORDER BY b.bookingDate DESC")
    List<EventBooking> findByBookingDateBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(b) FROM EventBooking b WHERE b.bookingDate BETWEEN :from AND :to AND b.status <> :cancelled")
    long countActiveBookingsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
                                    @Param("cancelled") EventBooking.BookingStatus cancelled);

    // ── Availability checks ───────────────────────────────────────────────────

    @Query("SELECT COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.requestedDate = :date AND b.status <> :cancelled")
    long countActiveByTypeAndDate(@Param("type") String type, @Param("date") LocalDate date,
                                  @Param("cancelled") EventBooking.BookingStatus cancelled);

    @Query("SELECT COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.eventId = :entityId AND b.requestedDate = :date AND b.status <> :cancelled")
    long countActiveByTypeAndEventAndDate(@Param("type") String type, @Param("entityId") Long entityId,
                                          @Param("date") LocalDate date, @Param("cancelled") EventBooking.BookingStatus cancelled);

    @Query("SELECT COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.placeId = :entityId AND b.requestedDate = :date AND b.status <> :cancelled")
    long countActiveByTypeAndPlaceAndDate(@Param("type") String type, @Param("entityId") Long entityId,
                                          @Param("date") LocalDate date, @Param("cancelled") EventBooking.BookingStatus cancelled);

    @Query("SELECT COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.packageId = :entityId AND b.requestedDate = :date AND b.status <> :cancelled")
    long countActiveByTypeAndPackageAndDate(@Param("type") String type, @Param("entityId") Long entityId,
                                            @Param("date") LocalDate date, @Param("cancelled") EventBooking.BookingStatus cancelled);

    // ── Grouped counts per date (for blocked-dates API) ───────────────────────

    @Query("SELECT b.requestedDate, COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.requestedDate BETWEEN :from AND :to AND b.status <> :cancelled GROUP BY b.requestedDate")
    List<Object[]> countByTypeAndDateRange(@Param("type") String type, @Param("from") LocalDate from,
                                           @Param("to") LocalDate to, @Param("cancelled") EventBooking.BookingStatus cancelled);

    @Query("SELECT b.requestedDate, COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.eventId = :entityId AND b.requestedDate BETWEEN :from AND :to AND b.status <> :cancelled GROUP BY b.requestedDate")
    List<Object[]> countByTypeAndEventAndDateRange(@Param("type") String type, @Param("entityId") Long entityId,
                                                   @Param("from") LocalDate from, @Param("to") LocalDate to,
                                                   @Param("cancelled") EventBooking.BookingStatus cancelled);

    @Query("SELECT b.requestedDate, COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.placeId = :entityId AND b.requestedDate BETWEEN :from AND :to AND b.status <> :cancelled GROUP BY b.requestedDate")
    List<Object[]> countByTypeAndPlaceAndDateRange(@Param("type") String type, @Param("entityId") Long entityId,
                                                   @Param("from") LocalDate from, @Param("to") LocalDate to,
                                                   @Param("cancelled") EventBooking.BookingStatus cancelled);

    @Query("SELECT b.requestedDate, COUNT(b) FROM EventBooking b WHERE b.bookingType = :type AND b.packageId = :entityId AND b.requestedDate BETWEEN :from AND :to AND b.status <> :cancelled GROUP BY b.requestedDate")
    List<Object[]> countByTypeAndPackageAndDateRange(@Param("type") String type, @Param("entityId") Long entityId,
                                                     @Param("from") LocalDate from, @Param("to") LocalDate to,
                                                     @Param("cancelled") EventBooking.BookingStatus cancelled);

    @Query("SELECT b FROM EventBooking b WHERE " +
           "(b.bookingDate BETWEEN :from AND :to) OR " +
           "(b.requestedDate IS NOT NULL AND b.requestedDate BETWEEN :dateFrom AND :dateTo) " +
           "ORDER BY b.bookingDate DESC")
    List<EventBooking> findByBookingDateBetweenOrRequestedDateBetween(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo);

}
