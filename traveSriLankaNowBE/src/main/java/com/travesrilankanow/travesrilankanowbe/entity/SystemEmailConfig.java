package com.travesrilankanow.travesrilankanowbe.entity;

import com.travesrilankanow.travesrilankanowbe.entity.converter.EncryptedStringConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Singleton SMTP configuration, admin-editable. The id is always 1, enforced
 * at the DB level via a CHECK constraint so a race between two admin saves
 * can never produce a second row.
 *
 * Deliberately uses @Getter/@Setter (not Lombok @Data) so no auto-generated
 * toString() can ever print the (decrypted, in-memory) SMTP password.
 */
@Entity
@Table(name = "system_email_config", check = @CheckConstraint(name = "chk_system_email_config_singleton", constraint = "id = 1"))
@Getter
@Setter
public class SystemEmailConfig {

    @Id
    private Long id = 1L;

    private String smtpHost;

    private Integer smtpPort;

    private String smtpUsername;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String smtpPassword;

    @Column(nullable = false)
    private Boolean useTls = true;

    private String fromEmail;

    private String fromName;

    /** Recipient for booking-notification emails — independently settable, never derived from smtpUsername. */
    private String ownerNotificationEmail;

    @Column(nullable = false)
    private Boolean isActive = false;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.id = 1L;
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
