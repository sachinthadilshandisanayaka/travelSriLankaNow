package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.MasterData;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData.MasterDataType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterDataRepository extends JpaRepository<MasterData, Long> {

    List<MasterData> findByTypeOrderBySortOrderAsc(MasterDataType type);

    List<MasterData> findByTypeAndIsActiveTrueOrderBySortOrderAsc(MasterDataType type);

    List<MasterData> findByTypeAndIsActiveTrueAndVisibleOnPublicPageTrueOrderBySortOrderAsc(MasterDataType type);

    Optional<MasterData> findByTypeAndCode(MasterDataType type, String code);

    boolean existsByTypeAndCode(MasterDataType type, String code);

    boolean existsByTypeAndCodeAndIdNot(MasterDataType type, String code, Long id);

    List<MasterData> findAllByOrderByTypeAscSortOrderAsc();

    @Query("SELECT m FROM MasterData m WHERE m.type = :type " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MasterData> findByTypeAndSearch(
            @Param("type") MasterDataType type,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT m FROM MasterData m WHERE m.type = :type AND m.isActive = true " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MasterData> findByTypeAndIsActiveTrueAndSearch(
            @Param("type") MasterDataType type,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT m FROM MasterData m WHERE m.type = :type AND m.isActive = true AND m.visibleOnPublicPage = true " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(m.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MasterData> findByTypeAndIsActiveTrueAndVisibleOnPublicPageTrueAndSearch(
            @Param("type") MasterDataType type,
            @Param("search") String search,
            Pageable pageable);
}
