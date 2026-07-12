-- V23: Multi-company management schema

CREATE TABLE companies (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(200) NOT NULL,
    reg_number       VARCHAR(100),
    tax_id           VARCHAR(100),
    address_line1    VARCHAR(255),
    address_line2    VARCHAR(255),
    city             VARCHAR(100),
    country          VARCHAR(100) DEFAULT 'Sri Lanka',
    phone            VARCHAR(50),
    email            VARCHAR(150),
    website          VARCHAR(255),
    logo_url         TEXT,
    signature_url    TEXT,
    currency         VARCHAR(10)  DEFAULT 'LKR',
    tax_label        VARCHAR(30)  DEFAULT 'VAT',
    bank_name        VARCHAR(150),
    bank_account_no  VARCHAR(100),
    bank_swift       VARCHAR(30),
    payment_terms_days INT        DEFAULT 30,
    terms_conditions TEXT,
    invoice_prefix   VARCHAR(20)  DEFAULT 'INV',
    invoice_seq      BIGINT       DEFAULT 0,
    brevo_from_name  VARCHAR(100),
    brevo_from_email VARCHAR(150),
    is_active        BOOLEAN      DEFAULT TRUE,
    created_at       TIMESTAMP    DEFAULT NOW(),
    updated_at       TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE company_users (
    id          BIGSERIAL PRIMARY KEY,
    company_id  BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id     BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by VARCHAR(100),
    UNIQUE (company_id, user_id)
);

CREATE TABLE company_change_log (
    id          BIGSERIAL PRIMARY KEY,
    company_id  BIGINT       NOT NULL REFERENCES companies(id),
    changed_by  VARCHAR(100) NOT NULL,
    changed_at  TIMESTAMP    DEFAULT NOW(),
    ip_address  VARCHAR(50),
    field_name  VARCHAR(100) NOT NULL,
    old_value   TEXT,
    new_value   TEXT
);

CREATE INDEX idx_company_change_log_company ON company_change_log(company_id, changed_at DESC);
CREATE INDEX idx_company_users_user         ON company_users(user_id);
