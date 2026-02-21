package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.Media;
import com.travesrilankanow.travesrilankanowbe.entity.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Media entity operations.
 * Provides comprehensive querying capabilities for the media library.
 */
@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

    /**
     * Find media by Cloudinary public ID
     */
    Optional<Media> findByPublicId(String publicId);

    /**
     * Find media by URL
     */
    Optional<Media> findByUrl(String url);

    /**
     * Check if media exists by public ID
     */
    boolean existsByPublicId(String publicId);

    /**
     * Find all media by type
     */
    List<Media> findByMediaTypeOrderBySortOrderAsc(MediaType mediaType);

    /**
     * Find all active media by type
     */
    List<Media> findByMediaTypeAndIsActiveTrueOrderBySortOrderAsc(MediaType mediaType);

    /**
     * Find media by type with pagination
     */
    Page<Media> findByMediaType(MediaType mediaType, Pageable pageable);

    /**
     * Find all active media with pagination
     */
    Page<Media> findByIsActiveTrue(Pageable pageable);

    /**
     * Find media by entity reference
     */
    List<Media> findByEntityReferenceOrderBySortOrderAsc(String entityReference);

    /**
     * Find media by entity reference pattern (e.g., "location:%")
     */
    @Query("SELECT m FROM Media m WHERE m.entityReference LIKE :pattern ORDER BY m.sortOrder ASC")
    List<Media> findByEntityReferencePattern(@Param("pattern") String pattern);

    /**
     * Search media by filename or alt text
     */
    @Query("SELECT m FROM Media m WHERE " +
           "LOWER(m.originalFilename) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.altText) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.caption) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Media> searchMedia(@Param("query") String query, Pageable pageable);

    /**
     * Find unused media (not linked to any entity) older than specified date
     */
    @Query("SELECT m FROM Media m WHERE m.entityReference IS NULL AND m.createdAt < :beforeDate")
    List<Media> findUnusedMediaOlderThan(@Param("beforeDate") LocalDateTime beforeDate);

    /**
     * Count media by type
     */
    long countByMediaType(MediaType mediaType);

    /**
     * Count active media by type
     */
    long countByMediaTypeAndIsActiveTrue(MediaType mediaType);

    /**
     * Get total storage used (sum of file sizes)
     */
    @Query("SELECT COALESCE(SUM(m.fileSize), 0) FROM Media m")
    Long getTotalStorageUsed();

    /**
     * Get storage used by type
     */
    @Query("SELECT COALESCE(SUM(m.fileSize), 0) FROM Media m WHERE m.mediaType = :mediaType")
    Long getStorageUsedByType(@Param("mediaType") MediaType mediaType);

    /**
     * Delete media by public ID
     */
    @Modifying
    @Query("DELETE FROM Media m WHERE m.publicId = :publicId")
    void deleteByPublicId(@Param("publicId") String publicId);

    /**
     * Update entity reference for media
     */
    @Modifying
    @Query("UPDATE Media m SET m.entityReference = :reference WHERE m.id = :id")
    void updateEntityReference(@Param("id") Long id, @Param("reference") String reference);

    /**
     * Soft delete (deactivate) media
     */
    @Modifying
    @Query("UPDATE Media m SET m.isActive = false WHERE m.id = :id")
    void softDelete(@Param("id") Long id);

    /**
     * Find media by folder
     */
    List<Media> findByFolderOrderByCreatedAtDesc(String folder);

    /**
     * Get recent uploads
     */
    List<Media> findTop20ByOrderByCreatedAtDesc();

    /**
     * Find media uploaded by specific user
     */
    Page<Media> findByUploadedBy(String uploadedBy, Pageable pageable);
}
