-- V28: Switch invoice templates from JRXML to HTML, support multi-company assignment

-- Rename jrxml_url → template_url (now stores HTML file URL)
ALTER TABLE invoice_templates RENAME COLUMN jrxml_url TO template_url;

-- Multi-company template assignments
CREATE TABLE company_template_assignments (
    id          BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES invoice_templates(id) ON DELETE CASCADE,
    company_id  BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    is_active   BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP DEFAULT NOW(),
    assigned_by VARCHAR(100),
    UNIQUE(template_id, company_id)
);

-- Migrate existing company_id foreign keys
INSERT INTO company_template_assignments (template_id, company_id, is_active, assigned_at)
SELECT id, company_id, TRUE, created_at
FROM invoice_templates
WHERE company_id IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE INDEX idx_cta_company ON company_template_assignments(company_id, is_active);
CREATE INDEX idx_cta_template ON company_template_assignments(template_id);
