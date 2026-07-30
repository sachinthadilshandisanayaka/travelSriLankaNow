package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.SystemEmailConfigRequest;
import com.travesrilankanow.travesrilankanowbe.dto.SystemEmailConfigResponse;
import com.travesrilankanow.travesrilankanowbe.service.EmailService;
import com.travesrilankanow.travesrilankanowbe.service.SystemEmailConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/email-settings")
@RequiredArgsConstructor
public class AdminEmailSettingsController {

    private final SystemEmailConfigService configService;
    private final EmailService emailService;

    @GetMapping
    @PreAuthorize("hasAuthority('EMAIL_SETTINGS:VIEW')")
    public ResponseEntity<SystemEmailConfigResponse> getConfig() {
        return ResponseEntity.ok(SystemEmailConfigResponse.from(configService.getConfig()));
    }

    @PutMapping
    @PreAuthorize("hasAuthority('EMAIL_SETTINGS:UPDATE')")
    public ResponseEntity<SystemEmailConfigResponse> updateConfig(@RequestBody SystemEmailConfigRequest request) {
        return ResponseEntity.ok(SystemEmailConfigResponse.from(configService.updateConfig(request)));
    }

    @PostMapping("/test")
    @PreAuthorize("hasAuthority('EMAIL_SETTINGS:UPDATE')")
    public ResponseEntity<Map<String, String>> sendTestEmail(Authentication authentication) {
        String adminEmail = configService.getConfig().getOwnerNotificationEmail();
        if (adminEmail == null || adminEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Set an owner notification email first, then send a test."));
        }
        emailService.sendTestEmail(adminEmail);
        return ResponseEntity.ok(Map.of("message", "Test email queued for " + adminEmail));
    }
}
