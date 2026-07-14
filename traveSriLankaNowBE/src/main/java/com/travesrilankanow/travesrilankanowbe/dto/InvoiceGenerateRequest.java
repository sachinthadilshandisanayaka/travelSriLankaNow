package com.travesrilankanow.travesrilankanowbe.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceGenerateRequest {
    @NotNull
    private Long companyId;
    private Long templateId;
    private Long formId;

    private String customerName;
    private String customerContact;
    private String customerEmail;
    private String customerCountry;
    private String customerIdNumber;
    private String tourName;
    private String tourDuration;
    private LocalDate invoiceDate;
    private LocalDate dueDate;

    private String discountType;
    private BigDecimal discountValue;
    private Boolean discountOnTax;
    private BigDecimal taxRate;

    private Map<String, Object> formData;
    private List<InvoiceLineItemDto> lineItems;

    private boolean preview;
}
