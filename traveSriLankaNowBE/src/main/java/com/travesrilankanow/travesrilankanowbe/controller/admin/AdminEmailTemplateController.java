package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.EmailTemplateRequest;
import com.travesrilankanow.travesrilankanowbe.entity.EmailTemplate;
import com.travesrilankanow.travesrilankanowbe.service.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/email-templates")
@RequiredArgsConstructor
public class AdminEmailTemplateController {

    private final EmailTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasAuthority('EMAIL_TEMPLATE:VIEW')")
    public ResponseEntity<List<EmailTemplate>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('EMAIL_TEMPLATE:VIEW')")
    public ResponseEntity<EmailTemplate> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EMAIL_TEMPLATE:UPDATE')")
    public ResponseEntity<EmailTemplate> updateTemplate(@PathVariable Long id, @RequestBody EmailTemplateRequest request) {
        return ResponseEntity.ok(templateService.updateTemplate(id, request));
    }
}
