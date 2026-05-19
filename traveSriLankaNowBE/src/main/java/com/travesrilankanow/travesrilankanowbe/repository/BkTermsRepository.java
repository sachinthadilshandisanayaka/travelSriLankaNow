package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BkTerms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BkTermsRepository extends JpaRepository<BkTerms, Long> {
    List<BkTerms> findByBookingTypeCodeAndActiveTrue(String bookingTypeCode);
    List<BkTerms> findByBookingTypeCode(String bookingTypeCode);

    @Query("SELECT t FROM BkTerms t WHERE t.bookingTypeCode = :code AND t.active = TRUE " +
           "AND t.effectiveFrom <= :today AND (t.effectiveTo IS NULL OR t.effectiveTo >= :today) " +
           "ORDER BY t.version DESC")
    Optional<BkTerms> findCurrentActiveTerms(@Param("code") String bookingTypeCode,
                                              @Param("today") LocalDate today);
}
