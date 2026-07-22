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
    private final CloudinaryService cloudinaryService;

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

    public Page<MoreSectionItem> getActiveItemsBySectionSlug(String slug, String search, Pageable pageable) {
        MoreSection section = moreSectionRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("More section not found with slug: " + slug));
        return moreSectionItemRepository.searchActiveBySectionId(section.getId(), search, pageable);
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
        MoreSection section = moreSectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("More section not found with id: " + id));

        // Delete section image from Cloudinary
        cloudinaryService.deleteImageByUrl(section.getImageUrl());

        // Delete all item images from Cloudinary
        List<MoreSectionItem> items = moreSectionItemRepository.findBySectionIdOrderByDisplayOrderAsc(id);
        for (MoreSectionItem item : items) {
            cloudinaryService.deleteImageByUrl(item.getImageUrl());
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

    public Page<MoreSectionItem> getItemsBySectionSearch(Long sectionId, String search, Boolean active, String contentType, Pageable pageable) {
        return moreSectionItemRepository.searchBySectionId(sectionId, search, active, contentType, pageable);
    }

    public MoreSectionItem getItemById(Long itemId) {
        return moreSectionItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("More section item not found with id: " + itemId));
    }

    public MoreSectionItem getItemBySlug(String slug) {
        return moreSectionItemRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("More section item not found with slug: " + slug));
    }

    @Transactional
    public MoreSectionItem createItem(Long sectionId, MoreSectionItem item) {
        MoreSection section = getSectionById(sectionId);
        item.setSection(section);

        String slug = resolveItemSlug(item.getSlug(), item.getTitle());
        if (moreSectionItemRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("An item with slug '" + slug + "' already exists. Please choose a different slug.");
        }
        item.setSlug(slug);

        if (item.getDisplayOrder() == null || item.getDisplayOrder() == 0) {
            Integer maxOrder = moreSectionItemRepository.findMaxDisplayOrderBySectionId(sectionId);
            item.setDisplayOrder(maxOrder + 1);
        }
        return moreSectionItemRepository.save(item);
    }

    @Transactional
    public MoreSectionItem updateItem(Long itemId, MoreSectionItem itemDetails) {
        MoreSectionItem item = getItemById(itemId);

        String provided = itemDetails.getSlug();
        if (provided != null && !provided.isBlank()) {
            // Admin explicitly provided a slug — validate and apply it
            String slug = resolveItemSlug(provided, itemDetails.getTitle());
            if (moreSectionItemRepository.existsBySlugAndIdNot(slug, itemId)) {
                throw new IllegalArgumentException("An item with slug '" + slug + "' already exists. Please choose a different slug.");
            }
            item.setSlug(slug);
        } else if (item.getSlug() == null || item.getSlug().isBlank()) {
            // Item has no slug yet — generate one from the (possibly updated) title
            String generated = generateUniqueSlug(itemDetails.getTitle(), itemId);
            item.setSlug(generated);
        }
        // else: slug already exists and none was provided — keep it unchanged

        item.setTitle(itemDetails.getTitle());
        item.setShortDescription(itemDetails.getShortDescription());
        item.setDescription(itemDetails.getDescription());
        item.setImageUrl(itemDetails.getImageUrl());
        item.setLink(itemDetails.getLink());
        item.setContentType(itemDetails.getContentType());
        item.setArticleContent(itemDetails.getArticleContent());
        if (itemDetails.getAdditionalDetails() != null) item.setAdditionalDetails(itemDetails.getAdditionalDetails());
        if (itemDetails.getDisplayOrder() != null) item.setDisplayOrder(itemDetails.getDisplayOrder());
        if (itemDetails.getActive() != null) item.setActive(itemDetails.getActive());
        return moreSectionItemRepository.save(item);
    }

    private String resolveItemSlug(String providedSlug, String title) {
        if (providedSlug == null || providedSlug.isBlank()) {
            return generateItemSlug(title);
        }
        // Normalise user-provided slug: trim whitespace and leading/trailing hyphens
        String slug = providedSlug.trim().replaceAll("(^-+|-+$)", "");
        if (slug.isEmpty()) {
            return generateItemSlug(title);
        }
        if (!slug.matches("[a-z0-9]+(-[a-z0-9]+)*")) {
            throw new IllegalArgumentException("Slug must contain only lowercase letters, numbers, and hyphens (e.g. my-article-title).");
        }
        return slug;
    }

    private String generateItemSlug(String title) {
        if (title == null || title.isBlank()) return "item";
        return title.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private String generateUniqueSlug(String title, Long excludeId) {
        String base = generateItemSlug(title);
        if (!moreSectionItemRepository.existsBySlugAndIdNot(base, excludeId)) {
            return base;
        }
        return base + "-" + excludeId;
    }

    @Transactional
    public void deleteItem(Long itemId) {
        MoreSectionItem item = moreSectionItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("More section item not found with id: " + itemId));

        // Delete item image from Cloudinary
        cloudinaryService.deleteImageByUrl(item.getImageUrl());

        moreSectionItemRepository.deleteById(itemId);
    }

    @Transactional
    public MoreSectionItem toggleItemActiveStatus(Long itemId) {
        MoreSectionItem item = getItemById(itemId);
        item.setActive(!item.getActive());
        return moreSectionItemRepository.save(item);
    }
}
