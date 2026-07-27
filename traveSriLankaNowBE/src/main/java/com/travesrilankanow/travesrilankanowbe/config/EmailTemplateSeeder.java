package com.travesrilankanow.travesrilankanowbe.config;

import com.travesrilankanow.travesrilankanowbe.entity.AdminRole;
import com.travesrilankanow.travesrilankanowbe.entity.EmailTemplate;
import com.travesrilankanow.travesrilankanowbe.entity.Permission;
import com.travesrilankanow.travesrilankanowbe.repository.AdminRoleRepository;
import com.travesrilankanow.travesrilankanowbe.repository.EmailTemplateRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PermissionRepository;
import com.travesrilankanow.travesrilankanowbe.service.EmailTemplateKeys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * Idempotent startup seeder for the email system's default data — same
 * "if not exists, create" shape as DataInitializer. Runs on every startup
 * in every environment (Flyway migrations are not reliably applied against
 * this app's production database — see notes elsewhere in this codebase —
 * so one-time seed data goes through CommandLineRunners like this instead).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EmailTemplateSeeder implements CommandLineRunner {

    private final EmailTemplateRepository emailTemplateRepository;
    private final PermissionRepository permissionRepository;
    private final AdminRoleRepository adminRoleRepository;

    @Override
    public void run(String... args) {
        seedTemplateIfMissing(EmailTemplateKeys.BOOKING_CONFIRMATION_CUSTOMER,
                "email-templates/booking-confirmation-customer.html",
                "We've received your booking - {{bookingReference}}",
                "Sent to the customer right after they submit a booking (still pending, not yet confirmed).");
        seedTemplateIfMissing(EmailTemplateKeys.BOOKING_CONFIRMATION_OWNER,
                "email-templates/booking-confirmation-owner.html",
                "New booking received - {{bookingReference}}",
                "Sent to the configured owner-notification address after a booking is created.");
        seedTemplateIfMissing(EmailTemplateKeys.BOOKING_CONFIRMED_CUSTOMER,
                "email-templates/booking-confirmed-customer.html",
                "Your booking is confirmed - {{bookingReference}}",
                "Sent to the customer when an admin confirms their booking.");
        seedTemplateIfMissing(EmailTemplateKeys.BOOKING_CANCELLED_CUSTOMER,
                "email-templates/booking-cancelled-customer.html",
                "Your booking has been cancelled - {{bookingReference}}",
                "Sent to the customer when an admin cancels their booking.");
        seedTemplateIfMissing(EmailTemplateKeys.PASSWORD_RESET_OTP,
                "email-templates/password-reset-otp.html",
                "Your password reset code",
                "Sent when a customer requests a password reset.");

        seedEmailPermissions();
    }

    private void seedTemplateIfMissing(String key, String classpathHtml, String subject, String description) {
        if (emailTemplateRepository.existsByTemplateKey(key)) return;
        try {
            String html;
            try (var stream = new ClassPathResource(classpathHtml).getInputStream()) {
                html = IOUtils.toString(stream, StandardCharsets.UTF_8);
            }
            emailTemplateRepository.save(EmailTemplate.builder()
                    .templateKey(key)
                    .subject(subject)
                    .bodyHtml(html)
                    .description(description)
                    .isActive(true)
                    .build());
            log.info("Seeded default email template: {}", key);
        } catch (Exception e) {
            log.warn("Could not seed email template '{}': {}", key, e.getMessage());
        }
    }

    private void seedEmailPermissions() {
        String[][] perms = {
                {"EMAIL_SETTINGS", "VIEW", "View system email/SMTP settings"},
                {"EMAIL_SETTINGS", "UPDATE", "Update system email/SMTP settings"},
                {"EMAIL_TEMPLATE", "VIEW", "View email templates"},
                {"EMAIL_TEMPLATE", "UPDATE", "Update email templates"},
        };

        AdminRole superAdmin = adminRoleRepository.findByCode("SUPER_ADMIN").orElse(null);
        if (superAdmin == null) return;

        boolean changed = false;
        for (String[] p : perms) {
            Permission permission = permissionRepository.findByFunctionCodeAndAction(p[0], p[1])
                    .orElseGet(() -> {
                        Permission created = permissionRepository.save(new Permission(null, p[0], p[1], p[2]));
                        log.info("Seeded permission: {}:{}", p[0], p[1]);
                        return created;
                    });
            if (!superAdmin.getPermissions().contains(permission)) {
                superAdmin.getPermissions().add(permission);
                changed = true;
            }
        }
        if (changed) {
            adminRoleRepository.save(superAdmin);
            log.info("Granted email-system permissions to SUPER_ADMIN");
        }
    }
}
