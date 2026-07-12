package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByCompany_IdOrderByGeneratedAtDesc(Long companyId, Pageable pageable);
    Page<Invoice> findAllByOrderByGeneratedAtDesc(Pageable pageable);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM Invoice i WHERE i.company.id = :companyId AND " +
           "(:status IS NULL OR i.status = :status) ORDER BY i.generatedAt DESC")
    Page<Invoice> findByCompanyAndStatus(@Param("companyId") Long companyId,
                                         @Param("status") String status,
                                         Pageable pageable);
}
