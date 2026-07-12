package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.*;
import com.travesrilankanow.travesrilankanowbe.entity.*;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.*;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.samskivert.mustache.Mustache;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class InvoiceGenerationService {

    private final InvoiceRepository invoiceRepo;
    private final InvoiceLineItemRepository lineItemRepo;
    private final CompanyRepository companyRepo;
    private final InvoiceTemplateRepository templateRepo;
    private final InvoiceFormRepository formRepo;
    private final InvoiceFormFieldRepository formFieldRepo;
    private final InvoiceNumberService numberService;
    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.public-url}")
    private String publicUrl;

    // ── History ─────────────────────────────────────────────────────────────

    public Page<InvoiceDto> getInvoicesForCompany(Long companyId, String status, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Invoice> invoices = status != null && !status.isBlank()
                ? invoiceRepo.findByCompanyAndStatus(companyId, status, pageable)
                : invoiceRepo.findByCompany_IdOrderByGeneratedAtDesc(companyId, pageable);
        return invoices.map(this::toDto);
    }

    public Page<InvoiceDto> getAllInvoices(int page, int size) {
        return invoiceRepo.findAllByOrderByGeneratedAtDesc(PageRequest.of(page, size)).map(this::toDto);
    }

    public InvoiceDto getInvoiceById(Long id) {
        return toDto(findInvoice(id));
    }

    // ── Generate ─────────────────────────────────────────────────────────────

    @Transactional
    public InvoiceDto generateInvoice(InvoiceGenerateRequest request, String generatedBy) throws Exception {
        Company company = companyRepo.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.getCompanyId()));

        // --- pricing ---
        PricingResult pricing = calculatePricing(request, company);

        String invoiceNumber = numberService.nextInvoiceNumber(request.getCompanyId());

        InvoiceTemplate template = null;
        if (request.getTemplateId() != null) {
            template = templateRepo.findById(request.getTemplateId()).orElse(null);
        } else {
            // Template found by assignment — requires templateId from request
            template = null;
        }

        InvoiceForm form = null;
        if (request.getFormId() != null) {
            form = formRepo.findById(request.getFormId()).orElse(null);
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .company(company)
                .template(template)
                .form(form)
                .formVersion(form != null ? form.getVersion() : null)
                .customerName(request.getCustomerName())
                .customerContact(request.getCustomerContact())
                .customerEmail(request.getCustomerEmail())
                .customerCountry(request.getCustomerCountry())
                .customerIdNumber(request.getCustomerIdNumber())
                .tourName(request.getTourName())
                .tourDuration(request.getTourDuration())
                .invoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now())
                .dueDate(request.getDueDate())
                .currency(company.getCurrency())
                .subtotal(pricing.subtotal)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO)
                .discountOnTax(request.getDiscountOnTax() != null && request.getDiscountOnTax())
                .discountAmount(pricing.discountAmount)
                .taxLabel(company.getTaxLabel())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO)
                .taxAmount(pricing.taxAmount)
                .totalAmount(pricing.totalAmount)
                .formData(request.getFormData() != null ? request.getFormData() : new HashMap<>())
                .status(request.isPreview() ? "DRAFT" : "FINALIZED")
                .generatedBy(generatedBy)
                .build();

        Invoice saved = invoiceRepo.save(invoice);

        // save line items
        if (request.getLineItems() != null) {
            int order = 0;
            for (InvoiceLineItemDto itemDto : request.getLineItems()) {
                InvoiceLineItem li = InvoiceLineItem.builder()
                        .invoice(saved)
                        .description(itemDto.getDescription())
                        .quantity(itemDto.getQuantity() != null ? itemDto.getQuantity() : BigDecimal.ONE)
                        .unitPrice(itemDto.getUnitPrice() != null ? itemDto.getUnitPrice() : BigDecimal.ZERO)
                        .lineTotal(itemDto.getLineTotal() != null ? itemDto.getLineTotal()
                                : (itemDto.getQuantity() != null && itemDto.getUnitPrice() != null
                                    ? itemDto.getQuantity().multiply(itemDto.getUnitPrice()) : BigDecimal.ZERO))
                        .sortOrder(order++)
                        .build();
                lineItemRepo.save(li);
            }
        }

        // Generate PDF if template available
        if (template != null) {
            try {
                byte[] pdfBytes = renderPdf(saved, template, company, request.isPreview());
                String objectKey = "invoices/" + company.getId() + "/" +
                        LocalDate.now().getYear() + "/" +
                        LocalDate.now().getMonthValue() + "/" +
                        invoiceNumber + (request.isPreview() ? "_draft" : "") + ".pdf";

                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .stream(new ByteArrayInputStream(pdfBytes), pdfBytes.length, -1)
                        .contentType("application/pdf")
                        .build());

                String pdfUrl = buildUrl(objectKey);
                if (request.isPreview()) {
                    saved.setPdfDraftUrl(pdfUrl);
                } else {
                    saved.setPdfUrl(pdfUrl);
                }
                invoiceRepo.save(saved);
            } catch (Exception e) {
                log.warn("PDF generation failed for {}: {}", invoiceNumber, e.getMessage());
            }
        }

        return toDto(invoiceRepo.findById(saved.getId()).orElse(saved));
    }

    @Transactional
    public InvoiceDto updateStatus(Long id, String newStatus) {
        Invoice invoice = findInvoice(id);
        invoice.setStatus(newStatus);
        return toDto(invoiceRepo.save(invoice));
    }

    @Transactional
    public InvoiceDto voidInvoice(Long id, String reason, String voidedBy) {
        Invoice invoice = findInvoice(id);
        invoice.setStatus("VOID");
        invoice.setVoidedReason(reason);
        invoice.setVoidedBy(voidedBy);
        invoice.setVoidedAt(LocalDateTime.now());
        return toDto(invoiceRepo.save(invoice));
    }

    public String getPdfDownloadUrl(Long id) {
        Invoice invoice = findInvoice(id);
        return invoice.getPdfUrl();
    }

    // ── HTML PDF (OpenHTMLtoPDF + Mustache) ──────────────────────────────────

    private byte[] renderPdf(Invoice invoice, InvoiceTemplate template,
                              Company company, boolean isDraft) throws Exception {
        // Download HTML template from MinIO
        String objectKey = extractObjectKey(template.getTemplateUrl());
        String htmlTemplate;
        try (java.io.InputStream stream = minioClient.getObject(
                io.minio.GetObjectArgs.builder().bucket(bucketName).object(objectKey).build())) {
            htmlTemplate = IOUtils.toString(stream, java.nio.charset.StandardCharsets.UTF_8);
        }

        // Build variable context
        Map<String, Object> ctx = buildTemplateContext(invoice, company, isDraft);

        // Render Mustache template
        String filledHtml = Mustache.compiler()
                .escapeHTML(false)
                .compile(htmlTemplate)
                .execute(ctx);

        // Convert HTML → PDF
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfRendererBuilder builder = new PdfRendererBuilder();
        builder.useFastMode();
        builder.withHtmlContent(filledHtml, null);
        builder.toStream(out);
        builder.run();
        return out.toByteArray();
    }

    private Map<String, Object> buildTemplateContext(Invoice invoice, Company company, boolean isDraft) {
        Map<String, Object> ctx = new LinkedHashMap<>();

        // Company
        ctx.put("companyName", orEmpty(company.getName()));
        ctx.put("companyAddress", buildAddress(company));
        ctx.put("companyPhone", orEmpty(company.getPhone()));
        ctx.put("companyEmail", orEmpty(company.getEmail()));
        ctx.put("companyRegNo", orEmpty(company.getRegNumber()));
        ctx.put("companyTaxId", orEmpty(company.getTaxId()));
        ctx.put("bankName", orEmpty(company.getBankName()));
        ctx.put("bankAccountNo", orEmpty(company.getBankAccountNo()));
        ctx.put("bankSwift", orEmpty(company.getBankSwift()));
        ctx.put("termsConditions", orEmpty(company.getTermsConditions()));
        ctx.put("companyLogoUrl", orEmpty(company.getLogoUrl()));
        ctx.put("signatureUrl", orEmpty(company.getSignatureUrl()));
        ctx.put("companySignatureUrl", orEmpty(company.getSignatureUrl()));
        ctx.put("companyRegNumber", orEmpty(company.getRegNumber()));
        ctx.put("paymentTermsDays", company.getPaymentTermsDays() != null ? company.getPaymentTermsDays().toString() : "30");
        String cName = company.getName() != null && !company.getName().isEmpty() ? company.getName() : "?";
        ctx.put("companyInitial", String.valueOf(cName.charAt(0)).toUpperCase());

        // Invoice
        ctx.put("invoiceNumber", orEmpty(invoice.getInvoiceNumber()));
        ctx.put("invoiceDate", invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().toString() : "");
        ctx.put("dueDate", invoice.getDueDate() != null ? invoice.getDueDate().toString() : "");
        ctx.put("currency", orEmpty(invoice.getCurrency()));
        ctx.put("isDraft", isDraft);
        ctx.put("draftWatermark", isDraft ? "DRAFT" : "");

        // Customer
        ctx.put("customerName", orEmpty(invoice.getCustomerName()));
        ctx.put("customerContact", orEmpty(invoice.getCustomerContact()));
        ctx.put("customerEmail", orEmpty(invoice.getCustomerEmail()));
        ctx.put("customerCountry", orEmpty(invoice.getCustomerCountry()));
        ctx.put("customerIdNumber", orEmpty(invoice.getCustomerIdNumber()));

        // Tour
        ctx.put("tourName", orEmpty(invoice.getTourName()));
        ctx.put("tourDuration", orEmpty(invoice.getTourDuration()));

        // Pricing
        ctx.put("subtotal", invoice.getSubtotal() != null ? invoice.getSubtotal().toPlainString() : "0.00");
        ctx.put("discountAmount", invoice.getDiscountAmount() != null ? invoice.getDiscountAmount().toPlainString() : "0.00");
        ctx.put("taxLabel", orEmpty(invoice.getTaxLabel()));
        ctx.put("taxRate", invoice.getTaxRate() != null ? invoice.getTaxRate().toPlainString() : "0");
        ctx.put("taxAmount", invoice.getTaxAmount() != null ? invoice.getTaxAmount().toPlainString() : "0.00");
        ctx.put("totalAmount", invoice.getTotalAmount() != null ? invoice.getTotalAmount().toPlainString() : "0.00");

        // Dynamic form data
        if (invoice.getFormData() != null) {
            ctx.putAll(invoice.getFormData());
        }

        // Line items
        List<Map<String, Object>> lineItems = lineItemRepo.findByInvoice_IdOrderBySortOrderAsc(invoice.getId())
                .stream().map(li -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("description", orEmpty(li.getDescription()));
                    m.put("quantity", li.getQuantity() != null ? li.getQuantity().toPlainString() : "1");
                    m.put("unitPrice", li.getUnitPrice() != null ? li.getUnitPrice().toPlainString() : "0.00");
                    m.put("lineTotal", li.getLineTotal() != null ? li.getLineTotal().toPlainString() : "0.00");
                    return m;
                }).collect(Collectors.toList());
        ctx.put("lineItems", lineItems);

        return ctx;
    }

    // ── Pricing ──────────────────────────────────────────────────────────────

    private PricingResult calculatePricing(InvoiceGenerateRequest request, Company company) {
        BigDecimal subtotal = BigDecimal.ZERO;
        if (request.getLineItems() != null) {
            for (InvoiceLineItemDto item : request.getLineItems()) {
                BigDecimal qty = item.getQuantity() != null ? item.getQuantity() : BigDecimal.ONE;
                BigDecimal price = item.getUnitPrice() != null ? item.getUnitPrice() : BigDecimal.ZERO;
                subtotal = subtotal.add(qty.multiply(price));
            }
        }

        BigDecimal discountValue = request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if ("RATE".equalsIgnoreCase(request.getDiscountType())) {
            discountAmount = subtotal.multiply(discountValue).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if ("AMOUNT".equalsIgnoreCase(request.getDiscountType())) {
            discountAmount = discountValue;
        }

        BigDecimal taxRate = request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO;
        BigDecimal taxableAmount;
        if (Boolean.TRUE.equals(request.getDiscountOnTax())) {
            taxableAmount = subtotal;
        } else {
            taxableAmount = subtotal.subtract(discountAmount);
        }

        BigDecimal taxAmount = taxableAmount.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(taxAmount);

        return new PricingResult(subtotal, discountAmount, taxAmount, totalAmount);
    }

    private record PricingResult(BigDecimal subtotal, BigDecimal discountAmount,
                                  BigDecimal taxAmount, BigDecimal totalAmount) {}

    // ── Helpers ──────────────────────────────────────────────────────────────

    private Invoice findInvoice(Long id) {
        return invoiceRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + id));
    }

    private String buildAddress(Company c) {
        StringBuilder sb = new StringBuilder();
        if (c.getAddressLine1() != null) sb.append(c.getAddressLine1());
        if (c.getAddressLine2() != null) sb.append(", ").append(c.getAddressLine2());
        if (c.getCity() != null) sb.append(", ").append(c.getCity());
        if (c.getCountry() != null) sb.append(", ").append(c.getCountry());
        return sb.toString();
    }

    private String orEmpty(String s) { return s != null ? s : ""; }

    private String buildUrl(String objectKey) {
        return publicUrl.replaceAll("/+$", "") + "/" + bucketName + "/" + objectKey;
    }

    private String extractObjectKey(String url) {
        String prefix = publicUrl.replaceAll("/+$", "") + "/" + bucketName + "/";
        return url.startsWith(prefix) ? url.substring(prefix.length()) : url;
    }

    public InvoiceDto toDto(Invoice inv) {
        InvoiceDto dto = InvoiceDto.builder()
                .id(inv.getId())
                .invoiceNumber(inv.getInvoiceNumber())
                .companyId(inv.getCompany().getId())
                .companyName(inv.getCompany().getName())
                .templateId(inv.getTemplate() != null ? inv.getTemplate().getId() : null)
                .formId(inv.getForm() != null ? inv.getForm().getId() : null)
                .formVersion(inv.getFormVersion())
                .customerName(inv.getCustomerName())
                .customerContact(inv.getCustomerContact())
                .customerEmail(inv.getCustomerEmail())
                .customerCountry(inv.getCustomerCountry())
                .customerIdNumber(inv.getCustomerIdNumber())
                .tourName(inv.getTourName())
                .tourDuration(inv.getTourDuration())
                .invoiceDate(inv.getInvoiceDate())
                .dueDate(inv.getDueDate())
                .currency(inv.getCurrency())
                .subtotal(inv.getSubtotal())
                .discountType(inv.getDiscountType())
                .discountValue(inv.getDiscountValue())
                .discountOnTax(inv.getDiscountOnTax())
                .discountAmount(inv.getDiscountAmount())
                .taxLabel(inv.getTaxLabel())
                .taxRate(inv.getTaxRate())
                .taxAmount(inv.getTaxAmount())
                .totalAmount(inv.getTotalAmount())
                .formData(inv.getFormData())
                .status(inv.getStatus())
                .voidedReason(inv.getVoidedReason())
                .voidedBy(inv.getVoidedBy())
                .voidedAt(inv.getVoidedAt())
                .pdfUrl(inv.getPdfUrl())
                .pdfDraftUrl(inv.getPdfDraftUrl())
                .sentToEmail(inv.getSentToEmail())
                .sentCc(inv.getSentCc())
                .sentAt(inv.getSentAt())
                .sentBy(inv.getSentBy())
                .generatedBy(inv.getGeneratedBy())
                .generatedAt(inv.getGeneratedAt())
                .build();

        dto.setLineItems(lineItemRepo.findByInvoice_IdOrderBySortOrderAsc(inv.getId())
                .stream().map(li -> InvoiceLineItemDto.builder()
                        .id(li.getId())
                        .description(li.getDescription())
                        .quantity(li.getQuantity())
                        .unitPrice(li.getUnitPrice())
                        .lineTotal(li.getLineTotal())
                        .sortOrder(li.getSortOrder())
                        .build()).collect(Collectors.toList()));
        return dto;
    }
}
