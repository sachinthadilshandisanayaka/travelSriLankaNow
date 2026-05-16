package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.EventBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    @Query("SELECT COUNT(b) FROM EventBooking b WHERE b.bookingDate BETWEEN :from AND :to AND b.status <> 'cancelled'")
    long countActiveBookingsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

}
