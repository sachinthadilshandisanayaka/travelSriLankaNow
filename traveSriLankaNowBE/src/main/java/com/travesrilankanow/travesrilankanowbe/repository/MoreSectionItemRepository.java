package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSectionItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MoreSectionItemRepository extends JpaRepository<MoreSectionItem, Long> {

    List<MoreSectionItem> findBySectionIdAndActiveTrueOrderByDisplayOrderAsc(Long sectionId);

    List<MoreSectionItem> findBySectionIdOrderByDisplayOrderAsc(Long sectionId);

    Page<MoreSectionItem> findBySectionIdOrderByDisplayOrderAsc(Long sectionId, Pageable pageable);

    @Query("SELECT COALESCE(MAX(i.displayOrder), 0) FROM MoreSectionItem i WHERE i.section.id = :sectionId")
    Integer findMaxDisplayOrderBySectionId(Long sectionId);
}
