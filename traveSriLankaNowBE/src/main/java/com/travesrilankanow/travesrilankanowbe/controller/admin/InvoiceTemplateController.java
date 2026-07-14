package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.InvoiceTemplateDto;
import com.travesrilankanow.travesrilankanowbe.service.InvoiceTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/invoice-templates")
@RequiredArgsConstructor
public class InvoiceTemplateController {

    private final InvoiceTemplateService templateService;

    @GetMapping
    @PreAuthorize("hasAuthority('INVOICE_TEMPLATE:VIEW')")
    public ResponseEntity<List<InvoiceTemplateDto>> getAllTemplates(
            @RequestParam(required = false) Long companyId) {
        if (companyId != null) {
            return ResponseEntity.ok(templateService.getTemplatesForCompany(companyId));
        }
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVOICE_TEMPLATE:VIEW')")
    public ResponseEntity<InvoiceTemplateDto> getTemplate(@PathVariable Long id) {
        return ResponseEntity.ok(templateService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVOICE_TEMPLATE:CREATE')")
    public ResponseEntity<InvoiceTemplateDto> uploadTemplate(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "companyId", required = false) Long companyId,
            Authentication auth) throws Exception {
        return ResponseEntity.ok(
                templateService.upload(file, name, description, companyId, auth.getName()));
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAuthority('INVOICE_TEMPLATE:UPDATE')")
    public ResponseEntity<InvoiceTemplateDto> assignToCompany(@PathVariable Long id,
                                                               @RequestBody Map<String, Object> body,
                                                               Authentication auth) {
        Long companyId = Long.valueOf(body.get("companyId").toString());
        return ResponseEntity.ok(templateService.assignToCompany(id, companyId, auth.getName()));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasAuthority('INVOICE_TEMPLATE:DELETE')")
    public ResponseEntity<Void> removeAssignment(@PathVariable Long assignmentId) {
        templateService.removeAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INVOICE_TEMPLATE:DELETE')")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        templateService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
