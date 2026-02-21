package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoreSectionRepository extends JpaRepository<MoreSection, Long> {

    List<MoreSection> findByActiveTrueOrderByDisplayOrderAsc();

    Page<MoreSection> findAllByOrderByDisplayOrderAsc(Pageable pageable);

    Optional<MoreSection> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT COALESCE(MAX(s.displayOrder), 0) FROM MoreSection s")
    Integer findMaxDisplayOrder();
}
