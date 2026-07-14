package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByIsActiveTrueOrderByNameAsc();
    boolean existsByName(String name);

    @Query("SELECT c FROM Company c WHERE c.isActive = true ORDER BY c.name ASC")
    List<Company> findAllActive();

    @Modifying
    @Query("UPDATE Company c SET c.invoiceSeq = c.invoiceSeq + 1 WHERE c.id = :id")
    void incrementInvoiceSeq(@Param("id") Long id);
}
