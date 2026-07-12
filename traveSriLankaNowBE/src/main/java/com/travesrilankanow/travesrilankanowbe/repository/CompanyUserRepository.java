package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.CompanyUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyUserRepository extends JpaRepository<CompanyUser, Long> {
    List<CompanyUser> findByCompany_Id(Long companyId);
    Optional<CompanyUser> findByUser_Id(Long userId);
    boolean existsByCompany_IdAndUser_Id(Long companyId, Long userId);
    void deleteByCompany_IdAndUser_Id(Long companyId, Long userId);
}
