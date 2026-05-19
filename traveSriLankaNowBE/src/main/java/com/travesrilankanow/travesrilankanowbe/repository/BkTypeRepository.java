package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.BkType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BkTypeRepository extends JpaRepository<BkType, Long> {
    Optional<BkType> findByCode(String code);
    List<BkType> findAllByActiveTrue();
}
