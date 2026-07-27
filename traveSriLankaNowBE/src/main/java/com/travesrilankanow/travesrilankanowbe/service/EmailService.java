package com.travesrilankanow.travesrilankanowbe.service;

import com.samskivert.mustache.Mustache;
import com.travesrilankanow.travesrilankanowbe.entity.EmailTemplate;
import com.travesrilankanow.travesrilankanowbe.entity.SystemEmailConfig;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Sends admin-configurable, DB-driven emails. Deliberately not a static
 * Spring-Boot-auto-configured JavaMailSender bean built once from
 * application.properties (that would be immutable at startup) — instead
 * SystemEmailConfigService/EmailTemplateService are read (and cached) on
 * every send, so an admin's saved settings take effect on the very next
 * email with no app restart.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final SystemEmailConfigService configService;
    private final EmailTemplateService templateService;

    /**
     * Fire-and-forget: runs off the request thread and never throws, so a
     * slow/unreachable SMTP host can never add latency to (or fail) the
     * operation that triggered the email, e.g. creating a booking.
     *
     * The context map must be fully built by the caller from data already
     * in memory (not re-queried inside this method) — this is invoked
     * asynchronously, possibly before the caller's own transaction commits,
     * so a fresh DB read here could see stale or not-yet-committed state.
     */
    @Async("emailExecutor")
    public void sendTemplatedEmail(String templateKey, String toEmail, Map<String, Object> context) {
        if (toEmail == null || toEmail.isBlank()) return;
        try {
            SystemEmailConfig config = configService.getConfig();
            if (!Boolean.TRUE.equals(config.getIsActive())) {
                log.info("Email system inactive — skipping '{}' to {}", templateKey, toEmail);
                return;
            }
            EmailTemplate template = templateService.getActiveTemplateByKey(templateKey);

            String subject = render(template.getSubject(), context);
            String html = render(template.getBodyHtml(), context);

            send(config, toEmail, subject, html);
            log.info("Sent email templateKey={} to={}", templateKey, toEmail);
        } catch (Exception e) {
            log.error("Failed to send email templateKey={} to={}: {}", templateKey, toEmail, e.getMessage(), e);
        }
    }

    /** Sends a minimal test message using the currently-saved config, bypassing template lookup. */
    @Async("emailExecutor")
    public void sendTestEmail(String toEmail) {
        try {
            SystemEmailConfig config = configService.getConfig();
            send(config, toEmail, "Roam Lanka Travels — Test Email",
                    "<p>This is a test email confirming your SMTP settings are working.</p>");
            log.info("Sent test email to={}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send test email to={}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String render(String mustacheTemplate, Map<String, Object> context) {
        Map<String, Object> safeContext = context != null ? context : new HashMap<>();
        return Mustache.compiler().escapeHTML(false).compile(mustacheTemplate).execute(safeContext);
    }

    private void send(SystemEmailConfig config, String toEmail, String subject, String html) throws Exception {
        JavaMailSenderImpl sender = buildSender(config);
        MimeMessage message = sender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setTo(toEmail);
        helper.setFrom(config.getFromEmail(), config.getFromName());
        helper.setSubject(subject);
        helper.setText(html, true);
        sender.send(message);
    }

    private JavaMailSenderImpl buildSender(SystemEmailConfig config) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(config.getSmtpHost());
        if (config.getSmtpPort() != null) sender.setPort(config.getSmtpPort());
        sender.setUsername(config.getSmtpUsername());
        sender.setPassword(config.getSmtpPassword());
        sender.setDefaultEncoding("UTF-8");

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", String.valueOf(Boolean.TRUE.equals(config.getUseTls())));
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");
        return sender;
    }
}
