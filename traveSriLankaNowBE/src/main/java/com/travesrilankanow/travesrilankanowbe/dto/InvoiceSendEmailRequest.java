package com.travesrilankanow.travesrilankanowbe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceSendEmailRequest {
    @NotBlank
    @Email
    private String to;
    private String cc;
    private String subject;
    private String message;
}
