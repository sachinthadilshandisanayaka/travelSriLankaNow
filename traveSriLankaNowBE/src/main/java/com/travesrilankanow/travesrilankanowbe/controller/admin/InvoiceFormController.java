package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.InvoiceFormDto;
import com.travesrilankanow.travesrilankanowbe.dto.InvoiceFormFieldDto;
import com.travesrilankanow.travesrilankanowbe.service.InvoiceFormService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/invoice-forms")
@RequiredArgsConstructor
public class InvoiceFormController {

    private final InvoiceFormService formService;

    @GetMapping
    @PreAuthorize("hasAuthority('INVOICE_FORM:VIEW')")
    public ResponseEntity<List<InvoiceFormDto>> getForms(@RequestParam Long companyId) {
        return ResponseEntity.ok(formService.getFormsForCompany(companyId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVOICE_FORM:VIEW')")
    public ResponseEntity<InvoiceFormDto> getForm(@PathVariable Long id) {
        return ResponseEntity.ok(formService.getFormById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVOICE_FORM:CREATE')")
    public ResponseEntity<InvoiceFormDto> createForm(@RequestParam Long companyId,
                                                      @Valid @RequestBody InvoiceFormDto request,
                                                      Authentication auth) {
        return ResponseEntity.ok(formService.createForm(companyId, request, auth.getName()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('INVOICE_FORM:UPDATE')")
    public ResponseEntity<InvoiceFormDto> updateForm(@PathVariable Long id,
                                                      @RequestBody InvoiceFormDto request) {
        return ResponseEntity.ok(formService.updateForm(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('INVOICE_FORM:DELETE')")
    public ResponseEntity<Void> deactivateForm(@PathVariable Long id) {
        formService.deactivateForm(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{formId}/fields")
    @PreAuthorize("hasAuthority('INVOICE_FORM:UPDATE')")
    public ResponseEntity<InvoiceFormFieldDto> addField(@PathVariable Long formId,
                                                         @RequestBody InvoiceFormFieldDto dto) {
        return ResponseEntity.ok(formService.addField(formId, dto));
    }

    @PutMapping("/{formId}/fields/{fieldId}")
    @PreAuthorize("hasAuthority('INVOICE_FORM:UPDATE')")
    public ResponseEntity<InvoiceFormFieldDto> updateField(@PathVariable Long formId,
                                                            @PathVariable Long fieldId,
                                                            @RequestBody InvoiceFormFieldDto dto) {
        return ResponseEntity.ok(formService.updateField(formId, fieldId, dto));
    }

    @DeleteMapping("/{formId}/fields/{fieldId}")
    @PreAuthorize("hasAuthority('INVOICE_FORM:UPDATE')")
    public ResponseEntity<Void> deleteField(@PathVariable Long formId, @PathVariable Long fieldId) {
        formService.deleteField(formId, fieldId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{formId}/fields/order")
    @PreAuthorize("hasAuthority('INVOICE_FORM:UPDATE')")
    public ResponseEntity<Void> reorderFields(@PathVariable Long formId,
                                               @RequestBody List<Long> fieldIds) {
        formService.reorderFields(formId, fieldIds);
        return ResponseEntity.ok().build();
    }
}
