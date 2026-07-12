package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceDto {
    private Long id;
    private String invoiceNumber;
    private Long companyId;
    private String companyName;
    private Long templateId;
    private Long formId;
    private Integer formVersion;

    private String customerName;
    private String customerContact;
    private String customerEmail;
    private String customerCountry;
    private String customerIdNumber;
    private String tourName;
    private String tourDuration;
    private LocalDate invoiceDate;
    private LocalDate dueDate;

    private String currency;
    private BigDecimal subtotal;
    private String discountType;
    private BigDecimal discountValue;
    private Boolean discountOnTax;
    private BigDecimal discountAmount;
    private String taxLabel;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    private Map<String, Object> formData;
    private List<InvoiceLineItemDto> lineItems;

    private String status;
    private String voidedReason;
    private String voidedBy;
    private LocalDateTime voidedAt;

    private String pdfUrl;
    private String pdfDraftUrl;

    private String sentToEmail;
    private String sentCc;
    private LocalDateTime sentAt;
    private String sentBy;

    private String generatedBy;
    private LocalDateTime generatedAt;
}
