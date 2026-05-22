package com.travesrilankanow.travesrilankanowbe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    private boolean success;
    private String message;

    @JsonProperty("access_token")
    private String accessToken;

    @JsonProperty("refresh_token")
    private String refreshToken;

    private String username;

    @JsonProperty("first_name")
    private String firstName;

    private String role;

    @JsonProperty("admin_role_code")
    private String adminRoleCode;

    @JsonProperty("admin_role_name")
    private String adminRoleName;

    private List<String> permissions;
}
