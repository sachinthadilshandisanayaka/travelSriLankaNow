package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.PlaceInquiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlaceInquiryRepository extends JpaRepository<PlaceInquiry, Long> {
    Page<PlaceInquiry> findAllByOrderByInquiryDateDesc(Pageable pageable);
    Page<PlaceInquiry> findByPlaceIdOrderByInquiryDateDesc(Long placeId, Pageable pageable);
}
