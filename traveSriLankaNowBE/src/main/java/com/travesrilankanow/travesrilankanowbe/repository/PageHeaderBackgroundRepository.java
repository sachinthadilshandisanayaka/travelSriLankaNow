package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.PageHeaderBackground;
import com.travesrilankanow.travesrilankanowbe.entity.PageType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PageHeaderBackgroundRepository extends JpaRepository<PageHeaderBackground, Long> {

    List<PageHeaderBackground> findByPageTypeOrderByDisplayOrderAsc(PageType pageType);

    Optional<PageHeaderBackground> findByPageTypeAndIsActiveTrue(PageType pageType);

    List<PageHeaderBackground> findAllByOrderByPageTypeAscDisplayOrderAsc();

    @Query("SELECT COALESCE(MAX(p.displayOrder), 0) FROM PageHeaderBackground p WHERE p.pageType = :pageType")
    Integer findMaxDisplayOrderByPageType(@Param("pageType") PageType pageType);

    @Modifying
    @Query("UPDATE PageHeaderBackground p SET p.isActive = false WHERE p.pageType = :pageType AND p.id != :id")
    void deactivateOthersForPageType(@Param("pageType") PageType pageType, @Param("id") Long id);

    @Modifying
    @Query("UPDATE PageHeaderBackground p SET p.isActive = false WHERE p.pageType = :pageType")
    void deactivateAllForPageType(@Param("pageType") PageType pageType);
}
