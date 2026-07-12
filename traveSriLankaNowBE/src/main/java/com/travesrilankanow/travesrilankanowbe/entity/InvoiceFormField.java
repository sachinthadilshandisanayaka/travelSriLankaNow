package com.travesrilankanow.travesrilankanowbe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "invoice_form_fields", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"form_id", "field_key"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceFormField {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private InvoiceForm form;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(name = "jasper_param_name", length = 100)
    private String jasperParamName;

    @Column(nullable = false, length = 200)
    private String label;

    @Column(name = "field_type", nullable = false, length = 30)
    private String fieldType;

    @Column(length = 255)
    private String placeholder;

    @Column(name = "default_value", columnDefinition = "TEXT")
    private String defaultValue;

    @Column(name = "is_required")
    @Builder.Default
    private Boolean isRequired = false;

    @Column(name = "is_line_item")
    @Builder.Default
    private Boolean isLineItem = false;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, String>> options;

    @Column(name = "validation_rules", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> validationRules;

    @Column(length = 100)
    private String section;
}
