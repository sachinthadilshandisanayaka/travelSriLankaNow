package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.ContactRequest;
import com.travesrilankanow.travesrilankanowbe.entity.ContactMessage;
import com.travesrilankanow.travesrilankanowbe.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;
    private final SystemEmailConfigService systemEmailConfigService;

    public ContactMessage submitContactMessage(ContactRequest request) {
        ContactMessage saved = contactMessageRepository.save(toEntity(request));

        // The message is already saved at this point — that's the part the
        // customer actually needs to succeed. Notification email is a
        // secondary effect, so any failure here (SMTP misconfigured, a
        // transient error reading SystemEmailConfig, etc.) must never turn
        // into a failed response for a customer whose message went through.
        try {
            triggerNotificationEmails(saved);
        } catch (Exception e) {
            log.error("Contact message {} saved, but failed to trigger notification emails: {}", saved.getId(), e.getMessage(), e);
        }

        return saved;
    }

    private void triggerNotificationEmails(ContactMessage saved) {
        Map<String, Object> ctx = buildEmailContext(saved);

        String ownerEmail = systemEmailConfigService.getConfig().getOwnerNotificationEmail();
        if (ownerEmail != null && !ownerEmail.isBlank()) {
            emailService.sendTemplatedEmail(EmailTemplateKeys.CONTACT_FORM_OWNER, ownerEmail, ctx);
        }
        if (saved.getEmail() != null && !saved.getEmail().isBlank()) {
            emailService.sendTemplatedEmail(EmailTemplateKeys.CONTACT_FORM_CUSTOMER, saved.getEmail(), ctx);
        }
    }

    private ContactMessage toEntity(ContactRequest request) {
        ContactMessage entity = new ContactMessage();
        entity.setName(request.getName().trim());
        entity.setPhone(request.getPhone().trim());
        entity.setEmail(request.getEmail() != null && !request.getEmail().isBlank() ? request.getEmail().trim() : null);
        entity.setMessage(request.getMessage().trim());
        return entity;
    }

    /**
     * EmailService renders templates with Mustache HTML-escaping disabled
     * (by design, so admin-authored template markup isn't mangled), which
     * means any raw user input placed in the context is injected verbatim
     * into the outgoing HTML email. Unlike the other templated emails in
     * this app (built from already-validated booking data), this context
     * is built directly from public, unauthenticated form input — so it's
     * escaped here before ever reaching the template.
     */
    private Map<String, Object> buildEmailContext(ContactMessage msg) {
        Map<String, Object> ctx = new HashMap<>();
        ctx.put("name", escapeHtml(msg.getName()));
        ctx.put("phone", escapeHtml(msg.getPhone()));
        ctx.put("email", msg.getEmail() != null ? escapeHtml(msg.getEmail()) : "Not provided");
        ctx.put("message", escapeHtml(msg.getMessage()).replace("\n", "<br>"));
        return ctx;
    }

    private String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
