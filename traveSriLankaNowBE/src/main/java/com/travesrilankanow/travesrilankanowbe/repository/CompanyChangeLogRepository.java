package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.CompanyChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyChangeLogRepository extends JpaRepository<CompanyChangeLog, Long> {
    List<CompanyChangeLog> findByCompany_IdOrderByChangedAtDesc(Long companyId);
}
