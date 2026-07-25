package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.TourPackage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<TourPackage, Long> {

    Optional<TourPackage> findBySlug(String slug);
    boolean existsBySlug(String slug);

    List<TourPackage> findByFeaturedTrue();

    List<TourPackage> findByFeaturedTrueOrderByDisplayOrderAscIdAsc();

    List<TourPackage> findByCategory(String category);

    @Query("SELECT p FROM TourPackage p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<TourPackage> searchPackages(@Param("query") String query);

    @Query("SELECT p FROM TourPackage p WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR p.category = :category)")
    Page<TourPackage> findBySearchAndCategory(
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable);
}
