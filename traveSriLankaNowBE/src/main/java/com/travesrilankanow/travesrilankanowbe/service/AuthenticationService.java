package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.AuthenticationRequest;
import com.travesrilankanow.travesrilankanowbe.dto.AuthenticationResponse;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import com.travesrilankanow.travesrilankanowbe.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (AuthenticationException e) {
            return AuthenticationResponse.builder()
                    .success(false)
                    .message("Invalid username or password")
                    .build();
        }

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return buildResponse(user, accessToken, refreshToken, "Login successful");
    }

    public AuthenticationResponse refreshToken(String refreshToken) {
        try {
            String username = jwtService.extractUsername(refreshToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new BadCredentialsException("User not found"));

            if (jwtService.isTokenValid(refreshToken, user)) {
                String newAccessToken = jwtService.generateToken(user);
                return buildResponse(user, newAccessToken, refreshToken, "Token refreshed successfully");
            }
        } catch (Exception e) {
            // Token is invalid
        }

        return AuthenticationResponse.builder()
                .success(false)
                .message("Invalid or expired refresh token")
                .build();
    }

    private AuthenticationResponse buildResponse(User user, String accessToken, String refreshToken, String message) {
        List<String> permissions = user.getAdminRole() != null
                ? user.getAdminRole().getPermissions().stream()
                        .map(p -> p.getFunctionCode() + ":" + p.getAction())
                        .sorted()
                        .collect(Collectors.toList())
                : Collections.emptyList();

        return AuthenticationResponse.builder()
                .success(true)
                .message(message)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .role(user.getRole().name())
                .adminRoleCode(user.getAdminRole() != null ? user.getAdminRole().getCode() : null)
                .adminRoleName(user.getAdminRole() != null ? user.getAdminRole().getName() : null)
                .permissions(permissions)
                .build();
    }

    public User createAdminUser(String username, String password, String email, String firstName, String lastName) {
        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .role(User.Role.ADMIN)
                .build();

        return userRepository.save(user);
    }
}
