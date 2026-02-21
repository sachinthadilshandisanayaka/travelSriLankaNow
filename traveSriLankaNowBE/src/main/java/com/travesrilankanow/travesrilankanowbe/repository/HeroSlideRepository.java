package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.HeroSlide;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HeroSlideRepository extends JpaRepository<HeroSlide, Long> {

    List<HeroSlide> findByActiveTrueOrderByDisplayOrderAsc();

    Page<HeroSlide> findAllByOrderByDisplayOrderAsc(Pageable pageable);

    @Query("SELECT COALESCE(MAX(h.displayOrder), 0) FROM HeroSlide h")
    Integer findMaxDisplayOrder();
}
