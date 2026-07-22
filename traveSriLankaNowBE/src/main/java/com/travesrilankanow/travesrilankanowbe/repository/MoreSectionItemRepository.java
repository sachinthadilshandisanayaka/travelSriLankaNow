package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSectionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MoreSectionItemRepository extends JpaRepository<MoreSectionItem, Long> {

    List<MoreSectionItem> findBySectionIdAndActiveTrueOrderByDisplayOrderAsc(Long sectionId);

    List<MoreSectionItem> findBySectionIdOrderByDisplayOrderAsc(Long sectionId);

    Page<MoreSectionItem> findBySectionIdOrderByDisplayOrderAsc(Long sectionId, Pageable pageable);

    @Query("SELECT i FROM MoreSectionItem i WHERE i.section.id = :sectionId " +
           "AND (:search IS NULL OR :search = '' OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.shortDescription) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:active IS NULL OR i.active = :active) " +
           "AND (:contentType IS NULL OR :contentType = '' OR i.contentType = :contentType)")
    Page<MoreSectionItem> searchBySectionId(
            @Param("sectionId") Long sectionId,
            @Param("search") String search,
            @Param("active") Boolean active,
            @Param("contentType") String contentType,
            Pageable pageable);

    @Query("SELECT i FROM MoreSectionItem i WHERE i.section.id = :sectionId AND i.active = true " +
           "AND (:search IS NULL OR :search = '' OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.shortDescription) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MoreSectionItem> searchActiveBySectionId(
            @Param("sectionId") Long sectionId,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COALESCE(MAX(i.displayOrder), 0) FROM MoreSectionItem i WHERE i.section.id = :sectionId")
    Integer findMaxDisplayOrderBySectionId(Long sectionId);

    Optional<MoreSectionItem> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
