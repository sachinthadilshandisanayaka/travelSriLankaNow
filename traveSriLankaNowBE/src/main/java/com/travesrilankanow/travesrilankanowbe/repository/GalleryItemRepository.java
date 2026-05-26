package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.GalleryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GalleryItemRepository extends JpaRepository<GalleryItem, Long> {

    Optional<GalleryItem> findBySlug(String slug);
    boolean existsBySlug(String slug);

    List<GalleryItem> findByFeaturedTrue();

    List<GalleryItem> findByFeaturedTrueOrderByDisplayOrderAsc();

    List<GalleryItem> findByCategory(String category);

    @Query("SELECT g FROM GalleryItem g WHERE " +
           "LOWER(g.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(g.description) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(g.location) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(g.photographer) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(g.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<GalleryItem> searchGalleryItems(@Param("query") String query);

    @Query("SELECT g FROM GalleryItem g WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(g.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(g.location) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(g.photographer) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(g.category) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:category IS NULL OR g.category = :category) " +
           "AND (:type IS NULL OR g.type = :type)")
    Page<GalleryItem> findBySearchAndCategoryAndType(
            @Param("search") String search,
            @Param("category") String category,
            @Param("type") String type,
            Pageable pageable);
}
