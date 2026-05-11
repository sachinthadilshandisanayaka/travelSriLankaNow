package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.NavConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NavConfigRepository extends JpaRepository<NavConfig, Long> {
    List<NavConfig> findByIsVisibleTrueOrderByDisplayOrderAsc();
    List<NavConfig> findAllByOrderByDisplayOrderAsc();
}
