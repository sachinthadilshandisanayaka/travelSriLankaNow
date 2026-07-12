-- V25: Dynamic invoice form builder (Google Forms-style)

CREATE TABLE invoice_forms (
    id          BIGSERIAL PRIMARY KEY,
    company_id  BIGINT       NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    version     INT          DEFAULT 1,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_by  VARCHAR(100),
    created_at  TIMESTAMP    DEFAULT NOW(),
    updated_at  TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE invoice_form_fields (
    id                 BIGSERIAL PRIMARY KEY,
    form_id            BIGINT       NOT NULL REFERENCES invoice_forms(id) ON DELETE CASCADE,
    field_key          VARCHAR(100) NOT NULL,
    jasper_param_name  VARCHAR(100),
    label              VARCHAR(200) NOT NULL,
    field_type         VARCHAR(30)  NOT NULL,
    placeholder        VARCHAR(255),
    default_value      TEXT,
    is_required        BOOLEAN      DEFAULT FALSE,
    is_line_item       BOOLEAN      DEFAULT FALSE,
    sort_order         INT          DEFAULT 0,
    options            JSONB,
    validation_rules   JSONB,
    section            VARCHAR(100),
    UNIQUE (form_id, field_key)
);

CREATE INDEX idx_invoice_form_fields_form ON invoice_form_fields(form_id, sort_order);
