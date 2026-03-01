package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.PasswordChangeRequest;
import com.travesrilankanow.travesrilankanowbe.dto.ProfileResponse;
import com.travesrilankanow.travesrilankanowbe.dto.ProfileUpdateRequest;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import com.travesrilankanow.travesrilankanowbe.security.JwtService;
import com.travesrilankanow.travesrilankanowbe.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {

    private final ProfileService profileService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Principal principal) {
        return ResponseEntity.ok(profileService.getProfile(principal.getName()));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(
            Principal principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        try {
            ProfileResponse profile = profileService.updateProfile(principal.getName(), request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("profile", profile);

            // If username changed, issue new tokens
            if (!principal.getName().equals(request.getUsername())) {
                User updatedUser = userRepository.findByUsername(request.getUsername())
                        .orElseThrow();
                response.put("access_token", jwtService.generateToken(updatedUser));
                response.put("refresh_token", jwtService.generateRefreshToken(updatedUser));
                response.put("username_changed", true);
            }

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(
            Principal principal,
            @Valid @RequestBody PasswordChangeRequest request) {
        try {
            profileService.changePassword(principal.getName(), request);
            return ResponseEntity.ok(Map.of("success", true, "message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("success", false, "message", e.getMessage()));
        }
    }
}
