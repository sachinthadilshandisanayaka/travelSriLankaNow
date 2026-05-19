package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BkStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BkStatusRepository extends JpaRepository<BkStatus, Long> {
    Optional<BkStatus> findByCode(String code);
    List<BkStatus> findAllByActiveTrue();
    List<BkStatus> findAllByOrderByDisplayOrderAsc();
}
