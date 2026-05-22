package com.travesrilankanow.travesrilankanowbe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class AdminRoleCreateRequest {

    @NotBlank
    @Size(min = 2, max = 50)
    @Pattern(regexp = "^[A-Z0-9_]+$", message = "Role code must be uppercase letters, digits, and underscores only")
    private String code;

    @NotBlank
    @Size(min = 2, max = 100)
    private String name;

    private String description;

    private List<Long> permissionIds;
}
