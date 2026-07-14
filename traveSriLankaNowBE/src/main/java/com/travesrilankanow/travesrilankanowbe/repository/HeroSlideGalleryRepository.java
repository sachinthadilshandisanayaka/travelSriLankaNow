package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.HeroSlideGallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HeroSlideGalleryRepository extends JpaRepository<HeroSlideGallery, Long> {

    Optional<HeroSlideGallery> findByHeroSlide_Id(Long heroSlideId);

    @Query("SELECT g FROM HeroSlideGallery g JOIN FETCH g.items WHERE g.heroSlide.id IN :slideIds AND g.enabled = true")
    List<HeroSlideGallery> findEnabledWithItemsBySlideIds(@Param("slideIds") List<Long> slideIds);
}
