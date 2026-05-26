package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.Location;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LocationService {

    private final LocationRepository locationRepository;
    private final CloudinaryService cloudinaryService;

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
    }

    public Location getLocationBySlug(String slug) {
        return locationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with slug: " + slug));
    }

    public List<Location> getFeaturedLocations() {
        return locationRepository.findByFeaturedTrueOrderByDisplayOrderAsc();
    }

    public List<Location> getLocationsByCategory(String category) {
        return locationRepository.findByCategory(category);
    }

    public List<Location> getLocationsByRegion(String region) {
        return locationRepository.findByRegion(region);
    }

    public List<Location> searchLocations(String query) {
        return locationRepository.searchLocations(query);
    }

    public org.springframework.data.domain.Page<Location> getLocationsPaginatedWithFilter(
            String search, String category, String region, org.springframework.data.domain.Pageable pageable) {
        String categoryFilter = null;
        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) {
            categoryFilter = category;
        }
        String regionFilter = null;
        if (region != null && !region.isEmpty() && !region.equalsIgnoreCase("all")) {
            regionFilter = region;
        }
        return locationRepository.findBySearchAndCategoryAndRegion(search, categoryFilter, regionFilter, pageable);
    }

    // Admin CRUD methods
    @Transactional
    public org.springframework.data.domain.Page<Location> getLocationsPaginated(org.springframework.data.domain.Pageable pageable) {
        return locationRepository.findAll(pageable);
    }

    @Transactional
    public Location createLocation(Location location) {
        if (location.getSlug() != null && !location.getSlug().isBlank() && locationRepository.existsBySlug(location.getSlug().trim())) {
            throw new IllegalArgumentException("Slug '" + location.getSlug().trim() + "' is already in use by another location");
        }
        return locationRepository.save(location);
    }

    @Transactional
    public Location updateLocation(Location location) {
        Location existing = locationRepository.findById(location.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + location.getId()));

        // Partial update - only update fields that are provided (non-null)
        if (location.getName() != null) {
            existing.setName(location.getName());
        }
        if (location.getDescription() != null) {
            existing.setDescription(location.getDescription());
        }
        if (location.getShortDescription() != null) {
            existing.setShortDescription(location.getShortDescription());
        }
        if (location.getImageUrl() != null) {
            existing.setImageUrl(location.getImageUrl());
        }
        if (location.getImages() != null && !location.getImages().isEmpty()) {
            existing.setImages(location.getImages());
        }
        if (location.getCategory() != null) {
            existing.setCategory(location.getCategory());
        }
        if (location.getRegion() != null) {
            existing.setRegion(location.getRegion());
        }
        if (location.getActivities() != null && !location.getActivities().isEmpty()) {
            existing.setActivities(location.getActivities());
        }
        if (location.getBestTimeToVisit() != null) {
            existing.setBestTimeToVisit(location.getBestTimeToVisit());
        }
        if (location.getRating() != null) {
            existing.setRating(location.getRating());
        }
        if (location.getFeatured() != null) {
            existing.setFeatured(location.getFeatured());
        }
        if (location.getDisplayOrder() != null) {
            existing.setDisplayOrder(location.getDisplayOrder());
        }
        if (location.getHighlights() != null && !location.getHighlights().isEmpty()) {
            existing.setHighlights(location.getHighlights());
        }
        if (location.getAdditionalDetails() != null) {
            existing.setAdditionalDetails(location.getAdditionalDetails());
        }
        if (location.getSlug() != null && !location.getSlug().isBlank()) {
            String newSlug = location.getSlug().trim();
            locationRepository.findBySlug(newSlug)
                    .filter(other -> !other.getId().equals(existing.getId()))
                    .ifPresent(other -> { throw new IllegalArgumentException("Slug '" + newSlug + "' is already in use by another location"); });
            existing.setSlug(newSlug);
        }

        return locationRepository.save(existing);
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));

        // Delete images from Cloudinary
        cloudinaryService.deleteImageByUrl(location.getImageUrl());
        cloudinaryService.deleteImagesByUrls(location.getImages());

        locationRepository.deleteById(id);
    }
}
