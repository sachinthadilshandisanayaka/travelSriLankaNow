package com.travesrilankanow.travesrilankanowbe.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Contact number is required")
    private String phone;

    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Message is required")
    private String message;
}
