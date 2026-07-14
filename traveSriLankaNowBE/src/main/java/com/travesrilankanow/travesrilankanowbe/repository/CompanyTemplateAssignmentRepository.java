package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.CompanyTemplateAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CompanyTemplateAssignmentRepository extends JpaRepository<CompanyTemplateAssignment, Long> {
    List<CompanyTemplateAssignment> findByCompany_IdAndIsActiveTrueOrderByAssignedAtDesc(Long companyId);
    List<CompanyTemplateAssignment> findByTemplate_IdOrderByAssignedAtDesc(Long templateId);
    Optional<CompanyTemplateAssignment> findByTemplate_IdAndCompany_Id(Long templateId, Long companyId);

    @Query("SELECT a FROM CompanyTemplateAssignment a WHERE a.company.id = :companyId AND a.isActive = true ORDER BY a.assignedAt DESC")
    List<CompanyTemplateAssignment> findActiveForCompany(@Param("companyId") Long companyId);
}
