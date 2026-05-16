package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.EventPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventPricingRepository extends JpaRepository<EventPricing, Long> {
    List<EventPricing> findByEventIdOrderByDisplayOrderAsc(Long eventId);
    void deleteByEventId(Long eventId);
}
