package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.dto.AuthenticationRequest;
import com.travesrilankanow.travesrilankanowbe.dto.AuthenticationResponse;
import com.travesrilankanow.travesrilankanowbe.dto.CustomerRegistrationRequest;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import com.travesrilankanow.travesrilankanowbe.security.JwtService;
import com.travesrilankanow.travesrilankanowbe.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final AuthenticationService authenticationService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CustomerRegistrationRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already taken"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered"));
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(User.Role.USER)
                .authProvider(User.AuthProvider.LOCAL)
                .build();

        User saved = userRepository.save(user);

        String accessToken = jwtService.generateToken(saved);
        String refreshToken = jwtService.generateRefreshToken(saved);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                AuthenticationResponse.builder()
                        .success(true)
                        .message("Registration successful")
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .username(saved.getUsername())
                        .firstName(saved.getFirstName())
                        .role(saved.getRole().name())
                        .build()
        );
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = authenticationService.authenticate(request);
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
