package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection;
import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection.SectionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HomepageSectionRepository extends JpaRepository<HomepageSection, Long> {

    List<HomepageSection> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<HomepageSection> findAllByOrderByDisplayOrderAsc();

    Optional<HomepageSection> findFirstBySectionType(SectionType sectionType);

    List<HomepageSection> findAllBySectionType(SectionType sectionType);

    boolean existsBySectionType(SectionType sectionType);
}
