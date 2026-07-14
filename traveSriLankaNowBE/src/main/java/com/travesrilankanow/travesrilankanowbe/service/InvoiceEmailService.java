package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.InvoiceSendEmailRequest;
import com.travesrilankanow.travesrilankanowbe.entity.Company;
import com.travesrilankanow.travesrilankanowbe.entity.Invoice;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.InvoiceRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceEmailService {

    private final InvoiceRepository invoiceRepo;
    private final MinioClient minioClient;
    private final RestTemplate restTemplate;

    @Value("${brevo.api-key:}")
    private String brevoApiKey;

    @Value("${brevo.default-from-name:Travel Sri Lanka Now}")
    private String defaultFromName;

    @Value("${brevo.default-from-email:noreply@travelsrilankanow.lk}")
    private String defaultFromEmail;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Value("${minio.public-url}")
    private String publicUrl;

    @Transactional
    public void sendInvoiceEmail(Long invoiceId, InvoiceSendEmailRequest request, String sentBy) {
        Invoice invoice = invoiceRepo.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found: " + invoiceId));

        if (invoice.getPdfUrl() == null) {
            throw new IllegalStateException("Invoice PDF not generated yet. Finalize the invoice first.");
        }

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            throw new IllegalStateException("Brevo API key not configured");
        }

        Company company = invoice.getCompany();
        String fromName = company.getBrevoFromName() != null ? company.getBrevoFromName() : defaultFromName;
        String fromEmail = company.getBrevoFromEmail() != null ? company.getBrevoFromEmail() : defaultFromEmail;
        String subject = request.getSubject() != null ? request.getSubject()
                : "Invoice " + invoice.getInvoiceNumber() + " from " + company.getName();

        byte[] pdfBytes = downloadPdf(invoice.getPdfUrl());
        String pdfBase64 = Base64.getEncoder().encodeToString(pdfBytes);

        Map<String, Object> body = buildBrevoPayload(fromName, fromEmail, request.getTo(),
                request.getCc(), subject, invoice, request.getMessage(), pdfBase64);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.brevo.com/v3/smtp/email", entity, String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Brevo API returned: " + response.getStatusCode());
        }

        invoice.setSentToEmail(request.getTo());
        invoice.setSentCc(request.getCc());
        invoice.setSentAt(LocalDateTime.now());
        invoice.setSentBy(sentBy);
        invoice.setEmailSubject(subject);
        if ("FINALIZED".equals(invoice.getStatus())) {
            invoice.setStatus("SENT");
        }
        invoiceRepo.save(invoice);

        log.info("Invoice {} sent to {} by {}", invoice.getInvoiceNumber(), request.getTo(), sentBy);
    }

    private Map<String, Object> buildBrevoPayload(String fromName, String fromEmail,
                                                    String to, String cc,
                                                    String subject, Invoice invoice,
                                                    String message, String pdfBase64) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sender", Map.of("name", fromName, "email", fromEmail));
        payload.put("to", List.of(Map.of("email", to)));

        if (cc != null && !cc.isBlank()) {
            payload.put("cc", Arrays.stream(cc.split(","))
                    .map(String::trim)
                    .filter(e -> !e.isEmpty())
                    .map(e -> Map.of("email", e))
                    .toList());
        }

        payload.put("subject", subject);

        String htmlContent = buildHtmlEmail(invoice, message);
        payload.put("htmlContent", htmlContent);

        payload.put("attachment", List.of(Map.of(
                "content", pdfBase64,
                "name", "Invoice-" + invoice.getInvoiceNumber() + ".pdf"
        )));

        return payload;
    }

    private String buildHtmlEmail(Invoice invoice, String customMessage) {
        String body = customMessage != null && !customMessage.isBlank()
                ? customMessage
                : "Please find attached your invoice " + invoice.getInvoiceNumber() + ".<br><br>"
                  + "Amount: " + invoice.getCurrency() + " " + invoice.getTotalAmount() + "<br>"
                  + "Due Date: " + (invoice.getDueDate() != null ? invoice.getDueDate() : "Upon receipt") + "<br><br>"
                  + "Thank you for your business.";
        return "<html><body><p>" + body + "</p></body></html>";
    }

    private byte[] downloadPdf(String pdfUrl) {
        try {
            String prefix = publicUrl.replaceAll("/+$", "") + "/" + bucketName + "/";
            String objectKey = pdfUrl.startsWith(prefix) ? pdfUrl.substring(prefix.length()) : pdfUrl;
            InputStream is = minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName).object(objectKey).build());
            return is.readAllBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to download invoice PDF: " + e.getMessage(), e);
        }
    }
}
