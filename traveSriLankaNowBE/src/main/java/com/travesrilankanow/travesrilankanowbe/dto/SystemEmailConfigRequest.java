package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.Data;

@Data
public class SystemEmailConfigRequest {
    private String smtpHost;
    private Integer smtpPort;
    private String smtpUsername;

    /** If null/blank, the existing stored password is kept unchanged. */
    private String smtpPassword;

    private Boolean useTls;
    private String fromEmail;
    private String fromName;
    private String ownerNotificationEmail;
    private Boolean isActive;
}
