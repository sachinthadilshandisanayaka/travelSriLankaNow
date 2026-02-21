package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByFeaturedTrue();

    List<Location> findByFeaturedTrueOrderByDisplayOrderAsc();

    List<Location> findByCategory(String category);

    List<Location> findByRegion(String region);

    @Query("SELECT l FROM Location l WHERE LOWER(l.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(l.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Location> searchLocations(@Param("query") String query);

    @Query("SELECT l FROM Location l WHERE " +
           "(:search IS NULL OR :search = '' OR LOWER(l.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR l.category = :category)")
    Page<Location> findBySearchAndCategory(
            @Param("search") String search,
            @Param("category") String category,
            Pageable pageable);
}
