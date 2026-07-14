package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.InvoiceForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceFormRepository extends JpaRepository<InvoiceForm, Long> {
    List<InvoiceForm> findByCompany_IdAndIsActiveTrueOrderByNameAsc(Long companyId);
    List<InvoiceForm> findByCompany_IdOrderByUpdatedAtDesc(Long companyId);
}
