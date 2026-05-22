package com.travesrilankanow.travesrilankanowbe.config;

import com.travesrilankanow.travesrilankanowbe.entity.AdminRole;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.repository.AdminRoleRepository;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminRoleRepository adminRoleRepository;

    @Value("${admin.default.username}")
    private String adminUsername;

    @Value("${admin.default.password}")
    private String adminPassword;

    @Value("${admin.default.email:admin@travelsrilankanow.com}")
    private String adminEmail;

    @Override
    public void run(String... args) {
        initializeAdminUser();
    }

    private void initializeAdminUser() {
        AdminRole superAdminRole = adminRoleRepository.findByCode("SUPER_ADMIN").orElse(null);

        if (!userRepository.existsByUsername(adminUsername)) {
            try {
                User adminUser = User.builder()
                        .username(adminUsername)
                        .password(passwordEncoder.encode(adminPassword))
                        .email(adminEmail)
                        .firstName("Admin")
                        .lastName("User")
                        .role(User.Role.ADMIN)
                        .adminRole(superAdminRole)
                        .build();
                userRepository.save(adminUser);
                log.info("Admin user created - Username: {}", adminUsername);
            } catch (Exception e) {
                log.warn("Could not create admin user ({}): {}", adminUsername, e.getMessage());
            }
        } else {
            log.info("Admin user already exists - Username: {}", adminUsername);
        }

        // Ensure every ADMIN-role user has SUPER_ADMIN assigned
        if (superAdminRole != null) {
            userRepository.findAll().stream()
                    .filter(u -> u.getRole() == User.Role.ADMIN && u.getAdminRole() == null)
                    .forEach(u -> {
                        u.setAdminRole(superAdminRole);
                        userRepository.save(u);
                        log.info("Assigned SUPER_ADMIN role to admin user: {}", u.getUsername());
                    });
        }
    }
}
