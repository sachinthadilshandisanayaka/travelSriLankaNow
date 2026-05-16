package com.travesrilankanow.travesrilankanowbe.dto;

import lombok.Data;

@Data
public class CustomerRegistrationRequest {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phoneNumber;
}
