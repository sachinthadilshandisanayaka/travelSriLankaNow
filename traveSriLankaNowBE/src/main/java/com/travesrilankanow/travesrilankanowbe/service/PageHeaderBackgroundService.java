package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.PageHeaderBackground;
import com.travesrilankanow.travesrilankanowbe.entity.PageType;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.PageHeaderBackgroundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PageHeaderBackgroundService {

    private final PageHeaderBackgroundRepository repository;
    private final CloudinaryService cloudinaryService;

    public List<PageHeaderBackground> getAllBackgrounds() {
        return repository.findAllByOrderByPageTypeAscDisplayOrderAsc();
    }

    public List<PageHeaderBackground> getBackgroundsByPageType(PageType pageType) {
        return repository.findByPageTypeOrderByDisplayOrderAsc(pageType);
    }

    public Optional<PageHeaderBackground> getActiveBackgroundByPageType(PageType pageType) {
        return repository.findByPageTypeAndIsActiveTrue(pageType);
    }

    public PageHeaderBackground getBackgroundById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Page header background not found with id: " + id));
    }

    @Transactional
    public PageHeaderBackground createBackground(PageHeaderBackground background) {
        if (background.getDisplayOrder() == null || background.getDisplayOrder() == 0) {
            Integer maxOrder = repository.findMaxDisplayOrderByPageType(background.getPageType());
            background.setDisplayOrder(maxOrder + 1);
        }

        // If this is set as active, deactivate others for same page type
        if (Boolean.TRUE.equals(background.getIsActive())) {
            repository.deactivateAllForPageType(background.getPageType());
        }

        return repository.save(background);
    }

    @Transactional
    public PageHeaderBackground updateBackground(Long id, PageHeaderBackground backgroundDetails) {
        PageHeaderBackground background = getBackgroundById(id);

        background.setPageType(backgroundDetails.getPageType());
        background.setImageUrl(backgroundDetails.getImageUrl());
        background.setSubtitle(backgroundDetails.getSubtitle());
        background.setTitle(backgroundDetails.getTitle());
        background.setDescription(backgroundDetails.getDescription());
        background.setOverlayColor(backgroundDetails.getOverlayColor());
        background.setOverlayOpacity(backgroundDetails.getOverlayOpacity());
        background.setDisplayOrder(backgroundDetails.getDisplayOrder());

        // Handle active status
        if (Boolean.TRUE.equals(backgroundDetails.getIsActive()) && !Boolean.TRUE.equals(background.getIsActive())) {
            repository.deactivateOthersForPageType(background.getPageType(), id);
        }
        background.setIsActive(backgroundDetails.getIsActive());

        return repository.save(background);
    }

    @Transactional
    public void deleteBackground(Long id) {
        PageHeaderBackground background = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Page header background not found with id: " + id));

        // Delete image from Cloudinary
        cloudinaryService.deleteImageByUrl(background.getImageUrl());

        repository.deleteById(id);
    }

    @Transactional
    public PageHeaderBackground activateBackground(Long id) {
        PageHeaderBackground background = getBackgroundById(id);

        // Deactivate all others for this page type
        repository.deactivateAllForPageType(background.getPageType());

        // Activate this one
        background.setIsActive(true);
        return repository.save(background);
    }

    @Transactional
    public PageHeaderBackground deactivateBackground(Long id) {
        PageHeaderBackground background = getBackgroundById(id);
        background.setIsActive(false);
        return repository.save(background);
    }
}
