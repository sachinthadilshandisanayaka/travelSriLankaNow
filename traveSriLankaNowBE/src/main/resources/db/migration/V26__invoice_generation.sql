-- V26: Invoice generation and history

CREATE TABLE invoice_customers (
    id         BIGSERIAL PRIMARY KEY,
    company_id BIGINT       NOT NULL REFERENCES companies(id),
    name       VARCHAR(200) NOT NULL,
    email      VARCHAR(150),
    phone      VARCHAR(50),
    country    VARCHAR(100),
    id_number  VARCHAR(100),
    created_at TIMESTAMP    DEFAULT NOW(),
    UNIQUE (company_id, email)
);

CREATE TABLE invoices (
    id               BIGSERIAL PRIMARY KEY,
    invoice_number   VARCHAR(50)  NOT NULL UNIQUE,
    company_id       BIGINT       NOT NULL REFERENCES companies(id),
    template_id      BIGINT       REFERENCES invoice_templates(id),
    form_id          BIGINT       REFERENCES invoice_forms(id),
    form_version     INT,

    customer_name    VARCHAR(200),
    customer_contact VARCHAR(100),
    customer_email   VARCHAR(150),
    customer_country VARCHAR(100),
    customer_id_number VARCHAR(100),

    tour_name        VARCHAR(300),
    tour_duration    VARCHAR(100),
    invoice_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
    due_date         DATE,

    currency         VARCHAR(10)  DEFAULT 'LKR',
    subtotal         NUMERIC(15,2) DEFAULT 0,
    discount_type    VARCHAR(10),
    discount_value   NUMERIC(15,2) DEFAULT 0,
    discount_on_tax  BOOLEAN      DEFAULT FALSE,
    discount_amount  NUMERIC(15,2) DEFAULT 0,
    tax_label        VARCHAR(30)  DEFAULT 'VAT',
    tax_rate         NUMERIC(5,2) DEFAULT 0,
    tax_amount       NUMERIC(15,2) DEFAULT 0,
    total_amount     NUMERIC(15,2) DEFAULT 0,

    form_data        JSONB        NOT NULL DEFAULT '{}',

    status           VARCHAR(20)  DEFAULT 'DRAFT',
    voided_reason    TEXT,
    voided_by        VARCHAR(100),
    voided_at        TIMESTAMP,

    pdf_url          TEXT,
    pdf_draft_url    TEXT,

    sent_to_email    VARCHAR(150),
    sent_cc          TEXT,
    sent_at          TIMESTAMP,
    sent_by          VARCHAR(100),
    email_subject    VARCHAR(500),

    generated_by     VARCHAR(100),
    generated_at     TIMESTAMP    DEFAULT NOW(),
    updated_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE invoice_line_items (
    id          BIGSERIAL PRIMARY KEY,
    invoice_id  BIGINT       NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(500),
    quantity    NUMERIC(10,2) DEFAULT 1,
    unit_price  NUMERIC(15,2) DEFAULT 0,
    line_total  NUMERIC(15,2) DEFAULT 0,
    sort_order  INT           DEFAULT 0
);

CREATE INDEX idx_invoices_company ON invoices(company_id, invoice_date DESC);
CREATE INDEX idx_invoices_status  ON invoices(status);
CREATE INDEX idx_invoices_number  ON invoices(invoice_number);
