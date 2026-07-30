package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.PasswordResetOtp;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.repository.PasswordResetOtpRepository;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Customer "forgot password" flow via a 6-digit OTP emailed to the account's
 * address. Deliberately never reveals whether an email is registered — every
 * outcome (unknown email, expired code, wrong code, locked out) either
 * no-ops silently (forgotPassword) or returns the same generic error message
 * (resetPassword), so responses can't be used to enumerate valid accounts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private static final int OTP_LENGTH = 6;
    private static final int EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final String INVALID_OR_EXPIRED = "Invalid or expired code";

    private final UserRepository userRepository;
    private final PasswordResetOtpRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) return;
        String normalizedEmail = email.trim();

        userRepository.findByEmail(normalizedEmail)
                .filter(user -> user.getAuthProvider() == User.AuthProvider.LOCAL)
                .ifPresent(user -> issueOtp(normalizedEmail, user));
    }

    private void issueOtp(String email, User user) {
        LocalDateTime cooldownCutoff = LocalDateTime.now().minusSeconds(RESEND_COOLDOWN_SECONDS);
        if (otpRepository.existsByEmailAndUsedFalseAndCreatedAtAfter(email, cooldownCutoff)) {
            log.info("Skipping OTP resend for {} — within cooldown window", email);
            return;
        }

        String rawOtp = generateOtp();
        otpRepository.save(PasswordResetOtp.builder()
                .email(email)
                .otpHash(passwordEncoder.encode(rawOtp))
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRY_MINUTES))
                .used(false)
                .attemptCount(0)
                .build());

        Map<String, Object> ctx = new HashMap<>();
        ctx.put("otp", rawOtp);
        ctx.put("firstName", user.getFirstName());
        ctx.put("expiryMinutes", EXPIRY_MINUTES);
        emailService.sendTemplatedEmail(EmailTemplateKeys.PASSWORD_RESET_OTP, email, ctx);
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        if (email == null || otp == null || newPassword == null || newPassword.isBlank()) {
            throw new IllegalArgumentException(INVALID_OR_EXPIRED);
        }
        String normalizedEmail = email.trim();

        PasswordResetOtp record = otpRepository.findTopByEmailAndUsedFalseOrderByCreatedAtDesc(normalizedEmail)
                .filter(r -> r.getExpiresAt().isAfter(LocalDateTime.now()))
                .filter(r -> r.getAttemptCount() < MAX_ATTEMPTS)
                .orElseThrow(() -> new IllegalArgumentException(INVALID_OR_EXPIRED));

        if (!passwordEncoder.matches(otp, record.getOtpHash())) {
            record.setAttemptCount(record.getAttemptCount() + 1);
            otpRepository.save(record);
            throw new IllegalArgumentException(INVALID_OR_EXPIRED);
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException(INVALID_OR_EXPIRED));

        record.setUsed(true);
        otpRepository.save(record);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password reset completed for {}", normalizedEmail);
    }

    private String generateOtp() {
        return String.format("%0" + OTP_LENGTH + "d", secureRandom.nextInt((int) Math.pow(10, OTP_LENGTH)));
    }
}
