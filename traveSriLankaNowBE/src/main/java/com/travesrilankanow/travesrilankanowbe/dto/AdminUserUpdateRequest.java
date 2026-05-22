package com.travesrilankanow.travesrilankanowbe.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {

    @Email
    private String email;

    private String firstName;
    private String lastName;
    private String adminRoleCode;
    private Boolean enabled;
}
