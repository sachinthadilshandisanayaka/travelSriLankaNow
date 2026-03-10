package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.GalleryItem;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.GalleryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GalleryService {

    private final GalleryItemRepository galleryItemRepository;
    private final CloudinaryService cloudinaryService;

    public List<GalleryItem> getAllGalleryItems() {
        return galleryItemRepository.findAll();
    }

    public GalleryItem getGalleryItemById(Long id) {
        return galleryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found with id: " + id));
    }

    public List<GalleryItem> getFeaturedGalleryItems() {
        return galleryItemRepository.findByFeaturedTrueOrderByDisplayOrderAsc();
    }

    public List<GalleryItem> getGalleryItemsByCategory(String category) {
        return galleryItemRepository.findByCategory(category);
    }

    public List<GalleryItem> searchGalleryItems(String query) {
        return galleryItemRepository.searchGalleryItems(query);
    }

    public org.springframework.data.domain.Page<GalleryItem> getGalleryItemsPaginatedWithFilter(
            String search, String category, String type, org.springframework.data.domain.Pageable pageable) {
        String categoryFilter = null;
        String typeFilter = null;

        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) {
            categoryFilter = category;
        }

        if (type != null && !type.isEmpty() && !type.equalsIgnoreCase("all")) {
            typeFilter = type;
        }

        return galleryItemRepository.findBySearchAndCategoryAndType(search, categoryFilter, typeFilter, pageable);
    }

    // Admin CRUD methods
    @Transactional
    public org.springframework.data.domain.Page<GalleryItem> getGalleryItemsPaginated(org.springframework.data.domain.Pageable pageable) {
        return galleryItemRepository.findAll(pageable);
    }

    @Transactional
    public GalleryItem createGalleryItem(GalleryItem galleryItem) {
        return galleryItemRepository.save(galleryItem);
    }

    @Transactional
    public GalleryItem updateGalleryItem(GalleryItem galleryItem) {
        GalleryItem existingItem = galleryItemRepository.findById(galleryItem.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found with id: " + galleryItem.getId()));

        // Partial update - only update fields that are provided (non-null)
        if (galleryItem.getType() != null) {
            existingItem.setType(galleryItem.getType());
        }
        if (galleryItem.getUrl() != null) {
            existingItem.setUrl(galleryItem.getUrl());
        }
        if (galleryItem.getThumbnailUrl() != null) {
            existingItem.setThumbnailUrl(galleryItem.getThumbnailUrl());
        }
        if (galleryItem.getTitle() != null) {
            existingItem.setTitle(galleryItem.getTitle());
        }
        if (galleryItem.getDescription() != null) {
            existingItem.setDescription(galleryItem.getDescription());
        }
        if (galleryItem.getCategory() != null) {
            existingItem.setCategory(galleryItem.getCategory());
        }
        if (galleryItem.getLocation() != null) {
            existingItem.setLocation(galleryItem.getLocation());
        }
        if (galleryItem.getTags() != null && !galleryItem.getTags().isEmpty()) {
            existingItem.setTags(galleryItem.getTags());
        }
        if (galleryItem.getPhotographer() != null) {
            existingItem.setPhotographer(galleryItem.getPhotographer());
        }
        if (galleryItem.getFeatured() != null) {
            existingItem.setFeatured(galleryItem.getFeatured());
        }
        if (galleryItem.getDisplayOrder() != null) {
            existingItem.setDisplayOrder(galleryItem.getDisplayOrder());
        }

        return galleryItemRepository.save(existingItem);
    }

    @Transactional
    public void deleteGalleryItem(Long id) {
        GalleryItem item = galleryItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gallery item not found with id: " + id));

        // Delete images from Cloudinary
        cloudinaryService.deleteImageByUrl(item.getUrl());
        cloudinaryService.deleteImageByUrl(item.getThumbnailUrl());

        galleryItemRepository.deleteById(id);
    }
}
