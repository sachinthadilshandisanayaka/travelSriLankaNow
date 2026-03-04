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

    public List<Location> getAllLocations() {
        return locationRepository.findAll();
    }

    public Location getLocationById(Long id) {
        return locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + id));
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
            String search, String category, org.springframework.data.domain.Pageable pageable) {
        String categoryFilter = null;
        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) {
            categoryFilter = category;
        }
        return locationRepository.findBySearchAndCategory(search, categoryFilter, pageable);
    }

    // Admin CRUD methods
    @Transactional
    public org.springframework.data.domain.Page<Location> getLocationsPaginated(org.springframework.data.domain.Pageable pageable) {
        return locationRepository.findAll(pageable);
    }

    @Transactional
    public Location createLocation(Location location) {
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

        return locationRepository.save(existing);
    }

    @Transactional
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Location not found with id: " + id);
        }
        locationRepository.deleteById(id);
    }
}
