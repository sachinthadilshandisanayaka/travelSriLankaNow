package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.SocialMediaContent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocialMediaContentRepository extends JpaRepository<SocialMediaContent, Long> {

    List<SocialMediaContent> findByActiveTrueOrderByDisplayOrderAsc();

    Page<SocialMediaContent> findAllByOrderByDisplayOrderAsc(Pageable pageable);

    @Query("SELECT COALESCE(MAX(s.displayOrder), 0) FROM SocialMediaContent s")
    Integer findMaxDisplayOrder();
}
