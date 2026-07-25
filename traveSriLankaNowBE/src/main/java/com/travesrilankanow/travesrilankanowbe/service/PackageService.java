package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.TourPackage;
import com.travesrilankanow.travesrilankanowbe.entity.PackageLocation;
import com.travesrilankanow.travesrilankanowbe.entity.PackagePricing;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PackageService {

    private final PackageRepository packageRepository;
    private final CloudinaryService cloudinaryService;

    public List<TourPackage> getAllPackages() {
        return packageRepository.findAll();
    }

    public TourPackage getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));
    }

    public TourPackage getPackageBySlug(String slug) {
        return packageRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with slug: " + slug));
    }

    public List<TourPackage> getFeaturedPackages() {
        return packageRepository.findByFeaturedTrueOrderByDisplayOrderAscIdAsc();
    }

    public List<TourPackage> getPackagesByCategory(String category) {
        return packageRepository.findByCategory(category);
    }

    public List<TourPackage> searchPackages(String query) {
        return packageRepository.searchPackages(query);
    }

    public org.springframework.data.domain.Page<TourPackage> getPackagesPaginatedWithFilter(
            String search, String category, org.springframework.data.domain.Pageable pageable) {
        String categoryFilter = null;
        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) {
            categoryFilter = category;
        }
        return packageRepository.findBySearchAndCategory(search, categoryFilter, pageable);
    }

    // Admin CRUD methods
    @Transactional
    public org.springframework.data.domain.Page<TourPackage> getPackagesPaginated(org.springframework.data.domain.Pageable pageable) {
        return packageRepository.findAll(pageable);
    }

    @Transactional
    public TourPackage createPackage(TourPackage pkg) {
        if (pkg.getSlug() != null && !pkg.getSlug().isBlank() && packageRepository.existsBySlug(pkg.getSlug().trim())) {
            throw new IllegalArgumentException("Slug '" + pkg.getSlug().trim() + "' is already in use by another package");
        }
        // Wire bidirectional references before cascade-saving
        if (pkg.getPackageLocations() != null) {
            for (PackageLocation loc : pkg.getPackageLocations()) {
                loc.setPkg(pkg);
            }
        }
        if (pkg.getPricings() != null) {
            for (PackagePricing pricing : pkg.getPricings()) {
                pricing.setPkg(pkg);
            }
        }
        return packageRepository.save(pkg);
    }

    @Transactional
    public TourPackage updatePackage(TourPackage pkg) {
        TourPackage existing = packageRepository.findById(pkg.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + pkg.getId()));

        // Partial update - only update fields that are provided (non-null)
        if (pkg.getTitle() != null) {
            existing.setTitle(pkg.getTitle());
        }
        if (pkg.getDescription() != null) {
            existing.setDescription(pkg.getDescription());
        }
        if (pkg.getShortDescription() != null) {
            existing.setShortDescription(pkg.getShortDescription());
        }
        if (pkg.getImageUrl() != null) {
            existing.setImageUrl(pkg.getImageUrl());
        }
        if (pkg.getCategory() != null) {
            existing.setCategory(pkg.getCategory());
        }
        if (pkg.getLocation() != null) {
            existing.setLocation(pkg.getLocation());
        }
        if (pkg.getDates() != null && !pkg.getDates().isEmpty()) {
            existing.setDates(pkg.getDates());
        }
        if (pkg.getPrice() != null) {
            existing.setPrice(pkg.getPrice());
        }
        if (pkg.getDuration() != null) {
            existing.setDuration(pkg.getDuration());
        }
        if (pkg.getMaxParticipants() != null) {
            existing.setMaxParticipants(pkg.getMaxParticipants());
        }
        if (pkg.getAvailableSpots() != null) {
            existing.setAvailableSpots(pkg.getAvailableSpots());
        }
        if (pkg.getIncluded() != null && !pkg.getIncluded().isEmpty()) {
            existing.setIncluded(pkg.getIncluded());
        }
        if (pkg.getRequirements() != null && !pkg.getRequirements().isEmpty()) {
            existing.setRequirements(pkg.getRequirements());
        }
        if (pkg.getRating() != null) {
            existing.setRating(pkg.getRating());
        }
        if (pkg.getFeatured() != null) {
            existing.setFeatured(pkg.getFeatured());
        }
        if (pkg.getDisplayOrder() != null) {
            existing.setDisplayOrder(pkg.getDisplayOrder());
        }
        if (pkg.getImages() != null) {
            existing.setImages(pkg.getImages());
        }
        if (pkg.getAdditionalDetails() != null) {
            existing.setAdditionalDetails(pkg.getAdditionalDetails());
        }

        if (pkg.getSlug() != null && !pkg.getSlug().isBlank()) {
            String newSlug = pkg.getSlug().trim();
            packageRepository.findBySlug(newSlug)
                    .filter(other -> !other.getId().equals(existing.getId()))
                    .ifPresent(other -> { throw new IllegalArgumentException("Slug '" + newSlug + "' is already in use by another package"); });
            existing.setSlug(newSlug);
        }

        // Replace package locations (orphanRemoval handles deletes)
        if (pkg.getPackageLocations() != null) {
            existing.getPackageLocations().clear();
            for (PackageLocation loc : pkg.getPackageLocations()) {
                loc.setPkg(existing);
                existing.getPackageLocations().add(loc);
            }
        }

        // Replace pricing options (orphanRemoval handles deletes)
        if (pkg.getPricings() != null) {
            existing.getPricings().clear();
            for (PackagePricing pricing : pkg.getPricings()) {
                pricing.setPkg(existing);
                existing.getPricings().add(pricing);
            }
        }

        return packageRepository.save(existing);
    }

    @Transactional
    public void deletePackage(Long id) {
        TourPackage pkg = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found with id: " + id));

        // Delete images from Cloudinary
        cloudinaryService.deleteImageByUrl(pkg.getImageUrl());
        cloudinaryService.deleteImagesByUrls(pkg.getImages());

        packageRepository.deleteById(id);
    }
}
