package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.EventLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EventLocationRepository extends JpaRepository<EventLocation, Long> {
    List<EventLocation> findByEventIdOrderByVisitOrderAsc(Long eventId);
    void deleteByEventId(Long eventId);
}
