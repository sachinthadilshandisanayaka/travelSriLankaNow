package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "permissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "function_code", nullable = false, length = 50)
    private String functionCode;

    @Column(nullable = false, length = 20)
    private String action; // VIEW, CREATE, UPDATE, DELETE, EXPORT

    @Column(length = 200)
    private String description;
}
