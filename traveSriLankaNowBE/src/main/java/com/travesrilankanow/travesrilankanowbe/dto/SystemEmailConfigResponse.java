package com.travesrilankanow.travesrilankanowbe.dto;

import com.travesrilankanow.travesrilankanowbe.entity.SystemEmailConfig;
import lombok.Data;

/** Admin-facing view of SystemEmailConfig — never exposes the raw/decrypted password. */
@Data
public class SystemEmailConfigResponse {
    private String smtpHost;
    private Integer smtpPort;
    private String smtpUsername;
    private boolean hasPassword;
    private Boolean useTls;
    private String fromEmail;
    private String fromName;
    private String ownerNotificationEmail;
    private Boolean isActive;

    public static SystemEmailConfigResponse from(SystemEmailConfig cfg) {
        SystemEmailConfigResponse r = new SystemEmailConfigResponse();
        r.setSmtpHost(cfg.getSmtpHost());
        r.setSmtpPort(cfg.getSmtpPort());
        r.setSmtpUsername(cfg.getSmtpUsername());
        r.setHasPassword(cfg.getSmtpPassword() != null && !cfg.getSmtpPassword().isEmpty());
        r.setUseTls(cfg.getUseTls());
        r.setFromEmail(cfg.getFromEmail());
        r.setFromName(cfg.getFromName());
        r.setOwnerNotificationEmail(cfg.getOwnerNotificationEmail());
        r.setIsActive(cfg.getIsActive());
        return r;
    }
}
