package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.Data;

@Data
public class EmailTemplateRequest {
    private String subject;
    private String bodyHtml;
    private Boolean isActive;
}
