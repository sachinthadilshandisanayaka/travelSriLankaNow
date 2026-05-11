package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.ContactDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactDetailRepository extends JpaRepository<ContactDetail, Long> {
    List<ContactDetail> findByEntityTypeAndEntityIdAndIsActiveTrueOrderByDisplayOrderAsc(
            String entityType, Long entityId);

    List<ContactDetail> findByEntityTypeAndEntityIdOrderByDisplayOrderAsc(
            String entityType, Long entityId);

    void deleteByEntityTypeAndEntityId(String entityType, Long entityId);
}
