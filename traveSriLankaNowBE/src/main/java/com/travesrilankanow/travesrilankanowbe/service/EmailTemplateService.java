package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.config.CacheConfig;
import com.travesrilankanow.travesrilankanowbe.dto.EmailTemplateRequest;
import com.travesrilankanow.travesrilankanowbe.entity.EmailTemplate;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.EmailTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmailTemplateService {

    private final EmailTemplateRepository repository;

    public List<EmailTemplate> getAllTemplates() {
        return repository.findAllByOrderByTemplateKeyAsc();
    }

    public EmailTemplate getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found: " + id));
    }

    /** Throws if missing or disabled — callers (EmailService) already catch-and-log every exception. */
    @Cacheable(cacheNames = CacheConfig.EMAIL_TEMPLATE_CACHE, key = "#key")
    public EmailTemplate getActiveTemplateByKey(String key) {
        EmailTemplate template = repository.findByTemplateKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found: " + key));
        if (!Boolean.TRUE.equals(template.getIsActive())) {
            throw new IllegalStateException("Email template is inactive: " + key);
        }
        return template;
    }

    @Transactional
    @CacheEvict(cacheNames = CacheConfig.EMAIL_TEMPLATE_CACHE, allEntries = true)
    public EmailTemplate updateTemplate(Long id, EmailTemplateRequest req) {
        EmailTemplate template = getById(id);
        if (req.getSubject() != null) template.setSubject(req.getSubject());
        if (req.getBodyHtml() != null) template.setBodyHtml(req.getBodyHtml());
        if (req.getIsActive() != null) template.setIsActive(req.getIsActive());
        return repository.save(template);
    }
}
