package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSection;
import com.travesrilankanow.travesrilankanowbe.entity.MoreSectionItem;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.MoreSectionItemRepository;
import com.travesrilankanow.travesrilankanowbe.repository.MoreSectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MoreSectionService {

    private final MoreSectionRepository moreSectionRepository;
    private final MoreSectionItemRepository moreSectionItemRepository;

    public List<MoreSection> getActiveSections() {
        return moreSectionRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public Page<MoreSection> getAllSectionsPaginated(Pageable pageable) {
        return moreSectionRepository.findAllByOrderByDisplayOrderAsc(pageable);
    }

    public MoreSection getSectionById(Long id) {
        return moreSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("More section not found with id: " + id));
    }

    public MoreSection getSectionBySlug(String slug) {
        MoreSection section = moreSectionRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("More section not found with slug: " + slug));
        // Load active items
        List<MoreSectionItem> activeItems = moreSectionItemRepository.findBySectionIdAndActiveTrueOrderByDisplayOrderAsc(section.getId());
        section.setItems(activeItems);
        return section;
    }

    @Transactional
    public MoreSection createSection(MoreSection section) {
        if (section.getDisplayOrder() == null || section.getDisplayOrder() == 0) {
            Integer maxOrder = moreSectionRepository.findMaxDisplayOrder();
            section.setDisplayOrder(maxOrder + 1);
        }
        return moreSectionRepository.save(section);
    }

    @Transactional
    public MoreSection updateSection(Long id, MoreSection sectionDetails) {
        MoreSection section = getSectionById(id);
        section.setName(sectionDetails.getName());
        section.setSlug(sectionDetails.getSlug());
        section.setDescription(sectionDetails.getDescription());
        section.setImageUrl(sectionDetails.getImageUrl());
        section.setDisplayOrder(sectionDetails.getDisplayOrder());
        section.setActive(sectionDetails.getActive());
        section.setAdditionalFieldDefinitions(sectionDetails.getAdditionalFieldDefinitions());
        return moreSectionRepository.save(section);
    }

    @Transactional
    public void deleteSection(Long id) {
        if (!moreSectionRepository.existsById(id)) {
            throw new ResourceNotFoundException("More section not found with id: " + id);
        }
        moreSectionRepository.deleteById(id);
    }

    @Transactional
    public MoreSection toggleActiveStatus(Long id) {
        MoreSection section = getSectionById(id);
        section.setActive(!section.getActive());
        return moreSectionRepository.save(section);
    }

    // Item management
    public List<MoreSectionItem> getItemsBySection(Long sectionId) {
        return moreSectionItemRepository.findBySectionIdOrderByDisplayOrderAsc(sectionId);
    }

    public Page<MoreSectionItem> getItemsBySectionPaginated(Long sectionId, Pageable pageable) {
        return moreSectionItemRepository.findBySectionIdOrderByDisplayOrderAsc(sectionId, pageable);
    }

    public MoreSectionItem getItemById(Long itemId) {
        return moreSectionItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("More section item not found with id: " + itemId));
    }

    @Transactional
    public MoreSectionItem createItem(Long sectionId, MoreSectionItem item) {
        MoreSection section = getSectionById(sectionId);
        item.setSection(section);
        if (item.getDisplayOrder() == null || item.getDisplayOrder() == 0) {
            Integer maxOrder = moreSectionItemRepository.findMaxDisplayOrderBySectionId(sectionId);
            item.setDisplayOrder(maxOrder + 1);
        }
        return moreSectionItemRepository.save(item);
    }

    @Transactional
    public MoreSectionItem updateItem(Long itemId, MoreSectionItem itemDetails) {
        MoreSectionItem item = getItemById(itemId);
        item.setTitle(itemDetails.getTitle());
        item.setShortDescription(itemDetails.getShortDescription());
        item.setDescription(itemDetails.getDescription());
        item.setImageUrl(itemDetails.getImageUrl());
        item.setLink(itemDetails.getLink());
        item.setAdditionalDetails(itemDetails.getAdditionalDetails());
        item.setDisplayOrder(itemDetails.getDisplayOrder());
        item.setActive(itemDetails.getActive());
        return moreSectionItemRepository.save(item);
    }

    @Transactional
    public void deleteItem(Long itemId) {
        if (!moreSectionItemRepository.existsById(itemId)) {
            throw new ResourceNotFoundException("More section item not found with id: " + itemId);
        }
        moreSectionItemRepository.deleteById(itemId);
    }

    @Transactional
    public MoreSectionItem toggleItemActiveStatus(Long itemId) {
        MoreSectionItem item = getItemById(itemId);
        item.setActive(!item.getActive());
        return moreSectionItemRepository.save(item);
    }
}
