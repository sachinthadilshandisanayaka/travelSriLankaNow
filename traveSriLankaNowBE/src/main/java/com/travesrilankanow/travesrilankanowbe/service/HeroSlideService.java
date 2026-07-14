package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.HeroSlide;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.HeroSlideGalleryRepository;
import com.travesrilankanow.travesrilankanowbe.repository.HeroSlideRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HeroSlideService {

    private final HeroSlideRepository heroSlideRepository;
    private final HeroSlideGalleryRepository heroSlideGalleryRepository;
    private final CloudinaryService cloudinaryService;

    public List<HeroSlide> getActiveHeroSlides() {
        var slides = heroSlideRepository.findByActiveTrueOrderByDisplayOrderAsc();
        attachGalleryImages(slides);
        return slides;
    }

    private void attachGalleryImages(List<HeroSlide> slides) {
        if (slides.isEmpty()) return;
        var ids = slides.stream().map(HeroSlide::getId).toList();
        var galleryMap = heroSlideGalleryRepository.findEnabledWithItemsBySlideIds(ids)
                .stream()
                .collect(Collectors.toMap(g -> g.getHeroSlide().getId(), g -> g));

        slides.forEach(slide -> {
            var gallery = galleryMap.get(slide.getId());
            if (gallery != null && gallery.isEnabled() && !gallery.getItems().isEmpty()) {
                var images = gallery.getItems().stream()
                        .map(item -> {
                            Map<String, String> m = new java.util.HashMap<>();
                            m.put("imageUrl", item.getImageUrl());
                            m.put("label", item.getLabel() != null ? item.getLabel() : "");
                            m.put("link", item.getLink() != null ? item.getLink() : "");
                            m.put("contentType", item.getContentType());
                            return m;
                        })
                        .toList();
                slide.setGalleryImages(images);
            }
        });
    }

    public Page<HeroSlide> getAllHeroSlidesPaginated(Pageable pageable) {
        return heroSlideRepository.findAllByOrderByDisplayOrderAsc(pageable);
    }

    public HeroSlide getHeroSlideById(Long id) {
        return heroSlideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hero slide not found with id: " + id));
    }

    @Transactional
    public HeroSlide createHeroSlide(HeroSlide heroSlide) {
        if (heroSlide.getDisplayOrder() == null || heroSlide.getDisplayOrder() == 0) {
            Integer maxOrder = heroSlideRepository.findMaxDisplayOrder();
            heroSlide.setDisplayOrder(maxOrder + 1);
        }
        return heroSlideRepository.save(heroSlide);
    }

    @Transactional
    public HeroSlide updateHeroSlide(Long id, HeroSlide heroSlideDetails) {
        HeroSlide heroSlide = getHeroSlideById(id);

        heroSlide.setTitle(heroSlideDetails.getTitle());
        heroSlide.setSubtitle(heroSlideDetails.getSubtitle());
        heroSlide.setImageUrl(heroSlideDetails.getImageUrl());
        heroSlide.setMediaType(heroSlideDetails.getMediaType() != null ? heroSlideDetails.getMediaType() : "image");
        heroSlide.setVideoUrl(heroSlideDetails.getVideoUrl());
        heroSlide.setTitleStyle(heroSlideDetails.getTitleStyle());
        heroSlide.setSubtitleStyle(heroSlideDetails.getSubtitleStyle());
        heroSlide.setContentAlign(heroSlideDetails.getContentAlign() != null ? heroSlideDetails.getContentAlign() : "center");
        heroSlide.setButtonText(heroSlideDetails.getButtonText());
        heroSlide.setButtonLink(heroSlideDetails.getButtonLink());
        heroSlide.setDisplayOrder(heroSlideDetails.getDisplayOrder());
        heroSlide.setActive(heroSlideDetails.getActive());
        heroSlide.setDisplayDuration(heroSlideDetails.getDisplayDuration());

        return heroSlideRepository.save(heroSlide);
    }

    @Transactional
    public void deleteHeroSlide(Long id) {
        HeroSlide heroSlide = heroSlideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hero slide not found with id: " + id));

        // Delete image from Cloudinary
        cloudinaryService.deleteImageByUrl(heroSlide.getImageUrl());

        heroSlideRepository.deleteById(id);
    }

    @Transactional
    public HeroSlide toggleActiveStatus(Long id) {
        HeroSlide heroSlide = getHeroSlideById(id);
        heroSlide.setActive(!heroSlide.getActive());
        return heroSlideRepository.save(heroSlide);
    }

    @Transactional
    public void updateDisplayOrder(Long id, Integer newOrder) {
        HeroSlide heroSlide = getHeroSlideById(id);
        heroSlide.setDisplayOrder(newOrder);
        heroSlideRepository.save(heroSlide);
    }
}
