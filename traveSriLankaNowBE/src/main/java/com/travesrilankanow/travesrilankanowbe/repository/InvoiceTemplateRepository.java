package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.InvoiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceTemplateRepository extends JpaRepository<InvoiceTemplate, Long> {
    List<InvoiceTemplate> findByCompany_IdAndIsActiveTrueOrderByVersionDesc(Long companyId);
    List<InvoiceTemplate> findAllByOrderByCreatedAtDesc();
    Optional<InvoiceTemplate> findFirstByCompany_IdAndIsActiveTrueOrderByVersionDesc(Long companyId);
}
