package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.SystemEmailConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemEmailConfigRepository extends JpaRepository<SystemEmailConfig, Long> {

    Optional<SystemEmailConfig> findTopByOrderByIdAsc();
}
