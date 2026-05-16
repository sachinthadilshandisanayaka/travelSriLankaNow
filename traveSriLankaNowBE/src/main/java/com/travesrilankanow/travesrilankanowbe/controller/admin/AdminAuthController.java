package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.AuthenticationRequest;
import com.travesrilankanow.travesrilankanowbe.dto.AuthenticationResponse;
import com.travesrilankanow.travesrilankanowbe.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = authenticationService.authenticate(request);

        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(response);
        }

        // Only ADMIN users may access the admin panel
        if (!"ADMIN".equals(response.getRole())) {
            return ResponseEntity.status(403).body(
                AuthenticationResponse.builder()
                    .success(false)
                    .message("Access denied. Admin credentials required.")
                    .build()
            );
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refresh_token");

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    AuthenticationResponse.builder()
                            .success(false)
                            .message("Refresh token is required")
                            .build()
            );
        }

        AuthenticationResponse response = authenticationService.refreshToken(refreshToken);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        // For stateless JWT, logout is handled client-side by removing the token
        // Server-side logout can be implemented with a token blacklist if needed
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logout successful"
        ));
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyToken() {
        // If this endpoint is reached, the token is valid (JWT filter validated it)
        return ResponseEntity.ok(Map.of(
                "valid", true
        ));
    }
}
