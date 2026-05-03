package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.HomepageSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HomepageSectionService {

    private final HomepageSectionRepository homepageSectionRepository;

    public List<HomepageSection> getAllSections() {
        return homepageSectionRepository.findAllByOrderByDisplayOrderAsc();
    }

    public List<HomepageSection> getActiveSections() {
        return homepageSectionRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public HomepageSection getSectionById(Long id) {
        return homepageSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Homepage section not found with id: " + id));
    }

    @Transactional
    public HomepageSection updateSection(Long id, HomepageSection sectionDetails) {
        HomepageSection section = getSectionById(id);

        section.setTitle(sectionDetails.getTitle());
        section.setSubtitle(sectionDetails.getSubtitle());
        section.setIsActive(sectionDetails.getIsActive());
        section.setConfig(sectionDetails.getConfig());

        return homepageSectionRepository.save(section);
    }

    @Transactional
    public HomepageSection toggleActiveStatus(Long id) {
        HomepageSection section = getSectionById(id);
        section.setIsActive(!section.getIsActive());
        return homepageSectionRepository.save(section);
    }

    @Transactional
    public void updateDisplayOrder(Long id, Integer newOrder) {
        HomepageSection section = getSectionById(id);
        section.setDisplayOrder(newOrder);
        homepageSectionRepository.save(section);
    }

    @Transactional
    public void reorderSections(List<Long> sectionIds) {
        for (int i = 0; i < sectionIds.size(); i++) {
            HomepageSection section = getSectionById(sectionIds.get(i));
            section.setDisplayOrder(i + 1);
            homepageSectionRepository.save(section);
        }
    }

    @Transactional
    public HomepageSection createSection(HomepageSection section) {
        if (section.getDisplayOrder() == null) section.setDisplayOrder(0);
        if (section.getIsActive() == null) section.setIsActive(true);
        return homepageSectionRepository.save(section);
    }

    @Transactional
    public void deleteSection(Long id) {
        HomepageSection section = getSectionById(id);
        homepageSectionRepository.delete(section);
    }
}
