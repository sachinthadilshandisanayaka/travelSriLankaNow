package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.SocialMediaContent;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.SocialMediaContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SocialMediaContentService {

    private final SocialMediaContentRepository socialMediaContentRepository;

    public List<SocialMediaContent> getActiveSocialMediaContent() {
        return socialMediaContentRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public Page<SocialMediaContent> getAllSocialMediaContentPaginated(Pageable pageable) {
        return socialMediaContentRepository.findAllByOrderByDisplayOrderAsc(pageable);
    }

    public SocialMediaContent getSocialMediaContentById(Long id) {
        return socialMediaContentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Social media content not found with id: " + id));
    }

    @Transactional
    public SocialMediaContent createSocialMediaContent(SocialMediaContent content) {
        if (content.getDisplayOrder() == null || content.getDisplayOrder() == 0) {
            Integer maxOrder = socialMediaContentRepository.findMaxDisplayOrder();
            content.setDisplayOrder(maxOrder + 1);
        }
        return socialMediaContentRepository.save(content);
    }

    @Transactional
    public SocialMediaContent updateSocialMediaContent(Long id, SocialMediaContent contentDetails) {
        SocialMediaContent content = getSocialMediaContentById(id);

        content.setPlatform(contentDetails.getPlatform());
        content.setUrl(contentDetails.getUrl());
        content.setThumbnailUrl(contentDetails.getThumbnailUrl());
        content.setTitle(contentDetails.getTitle());
        content.setDescription(contentDetails.getDescription());
        content.setDisplayOrder(contentDetails.getDisplayOrder());
        content.setActive(contentDetails.getActive());

        return socialMediaContentRepository.save(content);
    }

    @Transactional
    public void deleteSocialMediaContent(Long id) {
        if (!socialMediaContentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Social media content not found with id: " + id);
        }
        socialMediaContentRepository.deleteById(id);
    }

    @Transactional
    public SocialMediaContent toggleActiveStatus(Long id) {
        SocialMediaContent content = getSocialMediaContentById(id);
        content.setActive(!content.getActive());
        return socialMediaContentRepository.save(content);
    }

    @Transactional
    public void updateDisplayOrder(Long id, Integer newOrder) {
        SocialMediaContent content = getSocialMediaContentById(id);
        content.setDisplayOrder(newOrder);
        socialMediaContentRepository.save(content);
    }
}
