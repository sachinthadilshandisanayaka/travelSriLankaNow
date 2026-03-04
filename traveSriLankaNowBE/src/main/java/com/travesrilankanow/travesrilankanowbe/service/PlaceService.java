package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlaceService {

    private final PlaceRepository placeRepository;

    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    public Place getPlaceById(Long id) {
        return placeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Place not found with id: " + id));
    }

    public List<Place> getFeaturedPlaces() {
        return placeRepository.findByFeaturedTrueOrderByDisplayOrderAsc();
    }

    public List<Place> getPlacesByType(String type) {
        return placeRepository.findByType(type);
    }

    public List<Place> getPlacesByRegion(String region) {
        return placeRepository.findByRegion(region);
    }

    public List<Place> searchPlaces(String query) {
        return placeRepository.searchPlaces(query);
    }

    public org.springframework.data.domain.Page<Place> getPlacesPaginatedWithFilter(
            String search, String type, String priceRange, org.springframework.data.domain.Pageable pageable) {
        String typeFilter = null;
        String priceRangeFilter = null;

        if (type != null && !type.isEmpty() && !type.equalsIgnoreCase("all")) {
            typeFilter = type;
        }

        if (priceRange != null && !priceRange.isEmpty() && !priceRange.equalsIgnoreCase("all")) {
            priceRangeFilter = priceRange;
        }

        return placeRepository.findBySearchAndTypeAndPriceRange(search, typeFilter, priceRangeFilter, pageable);
    }

    // Admin CRUD methods
    @Transactional
    public org.springframework.data.domain.Page<Place> getPlacesPaginated(org.springframework.data.domain.Pageable pageable) {
        return placeRepository.findAll(pageable);
    }

    @Transactional
    public Place createPlace(Place place) {
        return placeRepository.save(place);
    }

    @Transactional
    public Place updatePlace(Place place) {
        Place existing = placeRepository.findById(place.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Place not found with id: " + place.getId()));

        // Partial update - only update fields that are provided (non-null)
        if (place.getName() != null) {
            existing.setName(place.getName());
        }
        if (place.getType() != null) {
            existing.setType(place.getType());
        }
        if (place.getDescription() != null) {
            existing.setDescription(place.getDescription());
        }
        if (place.getShortDescription() != null) {
            existing.setShortDescription(place.getShortDescription());
        }
        if (place.getImageUrl() != null) {
            existing.setImageUrl(place.getImageUrl());
        }
        if (place.getImages() != null && !place.getImages().isEmpty()) {
            existing.setImages(place.getImages());
        }
        if (place.getLocation() != null) {
            existing.setLocation(place.getLocation());
        }
        if (place.getRegion() != null) {
            existing.setRegion(place.getRegion());
        }
        if (place.getRating() != null) {
            existing.setRating(place.getRating());
        }
        if (place.getPriceRange() != null) {
            existing.setPriceRange(place.getPriceRange());
        }
        if (place.getCuisine() != null && !place.getCuisine().isEmpty()) {
            existing.setCuisine(place.getCuisine());
        }
        if (place.getAmenities() != null && !place.getAmenities().isEmpty()) {
            existing.setAmenities(place.getAmenities());
        }
        if (place.getContact() != null) {
            existing.setContact(place.getContact());
        }
        if (place.getAddress() != null) {
            existing.setAddress(place.getAddress());
        }
        if (place.getCoordinates() != null) {
            existing.setCoordinates(place.getCoordinates());
        }
        if (place.getOpeningHours() != null) {
            existing.setOpeningHours(place.getOpeningHours());
        }
        if (place.getFeatured() != null) {
            existing.setFeatured(place.getFeatured());
        }
        if (place.getDisplayOrder() != null) {
            existing.setDisplayOrder(place.getDisplayOrder());
        }
        if (place.getAdditionalDetails() != null) {
            existing.setAdditionalDetails(place.getAdditionalDetails());
        }

        return placeRepository.save(existing);
    }

    @Transactional
    public void deletePlace(Long id) {
        if (!placeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Place not found with id: " + id);
        }
        placeRepository.deleteById(id);
    }
}
