package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminUserDto {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String adminRoleCode;
    private String adminRoleName;
    private boolean enabled;
    private LocalDateTime createdAt;
}
