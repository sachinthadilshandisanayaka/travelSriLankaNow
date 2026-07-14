-- V24: Invoice template management (JRXML files stored in MinIO)

CREATE TABLE invoice_templates (
    id          BIGSERIAL PRIMARY KEY,
    company_id  BIGINT       REFERENCES companies(id) ON DELETE SET NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    jrxml_url   TEXT         NOT NULL,
    version     INT          DEFAULT 1,
    is_active   BOOLEAN      DEFAULT TRUE,
    uploaded_by VARCHAR(100),
    created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX idx_invoice_templates_company ON invoice_templates(company_id, is_active);
