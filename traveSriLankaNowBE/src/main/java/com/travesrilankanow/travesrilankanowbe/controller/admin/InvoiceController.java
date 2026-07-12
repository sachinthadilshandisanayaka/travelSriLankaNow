package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.InvoiceDto;
import com.travesrilankanow.travesrilankanowbe.dto.InvoiceGenerateRequest;
import com.travesrilankanow.travesrilankanowbe.dto.InvoiceSendEmailRequest;
import com.travesrilankanow.travesrilankanowbe.service.InvoiceEmailService;
import com.travesrilankanow.travesrilankanowbe.service.InvoiceGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceGenerationService invoiceService;
    private final InvoiceEmailService emailService;

    @GetMapping
    @PreAuthorize("hasAuthority('INVOICE_HISTORY:VIEW')")
    public ResponseEntity<Page<InvoiceDto>> getInvoices(
            @RequestParam Long companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(invoiceService.getInvoicesForCompany(companyId, status, page, size));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('COMPANY_MANAGEMENT:VIEW')")
    public ResponseEntity<Page<InvoiceDto>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(invoiceService.getAllInvoices(page, size));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('INVOICE_HISTORY:VIEW')")
    public ResponseEntity<InvoiceDto> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PostMapping("/preview")
    @PreAuthorize("hasAuthority('INVOICE_GENERATE:CREATE')")
    public ResponseEntity<InvoiceDto> previewInvoice(@Valid @RequestBody InvoiceGenerateRequest request,
                                                      Authentication auth) throws Exception {
        request.setPreview(true);
        return ResponseEntity.ok(invoiceService.generateInvoice(request, auth.getName()));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('INVOICE_GENERATE:CREATE')")
    public ResponseEntity<InvoiceDto> generateInvoice(@Valid @RequestBody InvoiceGenerateRequest request,
                                                       Authentication auth) throws Exception {
        request.setPreview(false);
        return ResponseEntity.ok(invoiceService.generateInvoice(request, auth.getName()));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('INVOICE_HISTORY:VIEW')")
    public ResponseEntity<Map<String, String>> getPdfUrl(@PathVariable Long id) {
        String url = invoiceService.getPdfDownloadUrl(id);
        return ResponseEntity.ok(Map.of("url", url != null ? url : ""));
    }

    @PostMapping("/{id}/send-email")
    @PreAuthorize("hasAuthority('INVOICE_GENERATE:CREATE')")
    public ResponseEntity<Void> sendEmail(@PathVariable Long id,
                                           @Valid @RequestBody InvoiceSendEmailRequest request,
                                           Authentication auth) {
        emailService.sendInvoiceEmail(id, request, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('INVOICE_GENERATE:CREATE')")
    public ResponseEntity<InvoiceDto> updateStatus(@PathVariable Long id,
                                                    @RequestParam String status) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, status));
    }

    @PostMapping("/{id}/void")
    @PreAuthorize("hasAuthority('INVOICE_VOID:DELETE')")
    public ResponseEntity<InvoiceDto> voidInvoice(@PathVariable Long id,
                                                   @RequestParam(required = false) String reason,
                                                   Authentication auth) {
        return ResponseEntity.ok(invoiceService.voidInvoice(id, reason, auth.getName()));
    }
}
