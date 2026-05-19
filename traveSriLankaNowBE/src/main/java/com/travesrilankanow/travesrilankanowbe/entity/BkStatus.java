package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bk_statuses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BkStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "is_terminal")
    private boolean terminal = false;

    @Column(name = "allows_edit")
    private boolean allowsEdit = false;

    @Column(name = "allows_cancel")
    private boolean allowsCancel = false;

    @Column(name = "display_order")
    private int displayOrder = 0;

    @Column(length = 20)
    private String color;

    @Column(length = 50)
    private String icon;
}
