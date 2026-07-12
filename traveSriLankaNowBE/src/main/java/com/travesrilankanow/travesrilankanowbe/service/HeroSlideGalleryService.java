package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.GalleryItemRequestDto;
import com.travesrilankanow.travesrilankanowbe.dto.GalleryUpdateRequest;
import com.travesrilankanow.travesrilankanowbe.entity.HeroSlideGallery;
import com.travesrilankanow.travesrilankanowbe.entity.HeroSlideGalleryItem;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.HeroSlideGalleryRepository;
import com.travesrilankanow.travesrilankanowbe.repository.HeroSlideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HeroSlideGalleryService {

    private final HeroSlideGalleryRepository galleryRepository;
    private final HeroSlideRepository heroSlideRepository;

    public HeroSlideGallery getGalleryForSlide(Long slideId) {
        ensureSlideExists(slideId);
        return galleryRepository.findByHeroSlide_Id(slideId)
                .orElseGet(() -> {
                    var slide = heroSlideRepository.getReferenceById(slideId);
                    var empty = new HeroSlideGallery();
                    empty.setHeroSlide(slide);
                    empty.setEnabled(false);
                    return empty; // unsaved — just returns the default shape
                });
    }

    @Transactional
    public HeroSlideGallery saveGallery(Long slideId, GalleryUpdateRequest request) {
        ensureSlideExists(slideId);
        var gallery = galleryRepository.findByHeroSlide_Id(slideId)
                .orElseGet(() -> {
                    var slide = heroSlideRepository.getReferenceById(slideId);
                    var g = new HeroSlideGallery();
                    g.setHeroSlide(slide);
                    return g;
                });

        gallery.setEnabled(request.enabled());
        gallery.getItems().clear();

        List<GalleryItemRequestDto> items = request.items() != null ? request.items() : List.of();
        for (int i = 0; i < items.size(); i++) {
            var dto = items.get(i);
            var item = new HeroSlideGalleryItem();
            item.setGallery(gallery);
            item.setContentType(dto.contentType());
            item.setContentId(dto.contentId());
            item.setImageUrl(dto.imageUrl());
            item.setLabel(dto.label());
            item.setLink(dto.link());
            item.setDisplayOrder(i);
            gallery.getItems().add(item);
        }

        return galleryRepository.save(gallery);
    }

    /** Used by public API to attach gallery images to active hero slides. */
    public List<HeroSlideGallery> findEnabledGalleriesForSlides(List<Long> slideIds) {
        if (slideIds.isEmpty()) return List.of();
        return galleryRepository.findEnabledWithItemsBySlideIds(slideIds);
    }

    private void ensureSlideExists(Long slideId) {
        if (!heroSlideRepository.existsById(slideId)) {
            throw new ResourceNotFoundException("Hero slide not found: " + slideId);
        }
    }
}
