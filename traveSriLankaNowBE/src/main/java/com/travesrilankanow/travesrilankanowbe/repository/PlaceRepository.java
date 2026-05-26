package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.Place;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    Optional<Place> findBySlug(String slug);
    boolean existsBySlug(String slug);

    List<Place> findByFeaturedTrue();

    List<Place> findByFeaturedTrueOrderByDisplayOrderAsc();

    List<Place> findByType(String type);

    List<Place> findByRegion(String region);

    @Query("SELECT p FROM Place p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Place> searchPlaces(@Param("query") String query);

    @Query("SELECT p FROM Place p WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:type IS NULL OR p.type = :type) " +
           "AND (:priceRange IS NULL OR p.priceRange = :priceRange)")
    Page<Place> findBySearchAndTypeAndPriceRange(
            @Param("search") String search,
            @Param("type") String type,
            @Param("priceRange") String priceRange,
            Pageable pageable);
}
