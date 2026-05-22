package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.AdminUserCreateRequest;
import com.travesrilankanow.travesrilankanowbe.dto.AdminUserDto;
import com.travesrilankanow.travesrilankanowbe.dto.AdminUserUpdateRequest;
import com.travesrilankanow.travesrilankanowbe.entity.AdminRole;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.AdminRoleRepository;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserManagementService {

    private final UserRepository userRepository;
    private final AdminRoleRepository adminRoleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<AdminUserDto> getAllAdminUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AdminUserDto getAdminUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (user.getRole() != User.Role.ADMIN) {
            throw new ResourceNotFoundException("User is not an admin: " + id);
        }
        return toDto(user);
    }

    @Transactional
    public AdminUserDto createAdminUser(AdminUserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken: " + request.getUsername());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use: " + request.getEmail());
        }
        AdminRole role = null;
        if (request.getAdminRoleCode() != null && !request.getAdminRoleCode().isBlank()) {
            role = adminRoleRepository.findByCode(request.getAdminRoleCode())
                    .orElseThrow(() -> new IllegalArgumentException("Admin role not found: " + request.getAdminRoleCode()));
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(User.Role.ADMIN)
                .adminRole(role)
                .build();
        return toDto(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto updateAdminUser(Long id, AdminUserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (request.getEmail() != null) {
            // Only check uniqueness if the email is actually changing
            if (!request.getEmail().equalsIgnoreCase(user.getEmail())
                    && userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());
        // Always update role: null = clear it, non-blank = look up and assign
        if (request.getAdminRoleCode() == null || request.getAdminRoleCode().isBlank()) {
            user.setAdminRole(null);
        } else {
            AdminRole role = adminRoleRepository.findByCode(request.getAdminRoleCode())
                    .orElseThrow(() -> new RuntimeException("Admin role not found: " + request.getAdminRoleCode()));
            user.setAdminRole(role);
        }
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void deleteAdminUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        // Soft delete — just disable the account
        user.setEnabled(false);
        userRepository.save(user);
    }

    private AdminUserDto toDto(User user) {
        return AdminUserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .adminRoleCode(user.getAdminRole() != null ? user.getAdminRole().getCode() : null)
                .adminRoleName(user.getAdminRole() != null ? user.getAdminRole().getName() : null)
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
