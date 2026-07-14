-- V27: New permissions and roles for invoice system

INSERT INTO permissions (function_code, action, description) VALUES
  ('COMPANY_MANAGEMENT', 'VIEW',   'View all companies'),
  ('COMPANY_MANAGEMENT', 'CREATE', 'Create new company'),
  ('COMPANY_MANAGEMENT', 'UPDATE', 'Update any company details'),
  ('COMPANY_MANAGEMENT', 'DELETE', 'Delete a company'),
  ('COMPANY_DETAILS',    'VIEW',   'View own company details'),
  ('COMPANY_DETAILS',    'UPDATE', 'Update own company details'),
  ('INVOICE_TEMPLATE',   'VIEW',   'View invoice templates'),
  ('INVOICE_TEMPLATE',   'CREATE', 'Upload invoice template'),
  ('INVOICE_TEMPLATE',   'UPDATE', 'Update/assign invoice template'),
  ('INVOICE_TEMPLATE',   'DELETE', 'Delete invoice template'),
  ('INVOICE_FORM',       'VIEW',   'View invoice forms'),
  ('INVOICE_FORM',       'CREATE', 'Create invoice form'),
  ('INVOICE_FORM',       'UPDATE', 'Edit invoice form'),
  ('INVOICE_FORM',       'DELETE', 'Delete invoice form'),
  ('INVOICE_GENERATE',   'VIEW',   'View invoice generation UI'),
  ('INVOICE_GENERATE',   'CREATE', 'Generate new invoice'),
  ('INVOICE_HISTORY',    'VIEW',   'View invoice history'),
  ('INVOICE_HISTORY',    'EXPORT', 'Export invoice history'),
  ('INVOICE_VOID',       'DELETE', 'Void/cancel an invoice')
ON CONFLICT (function_code, action) DO NOTHING;

-- New system roles
INSERT INTO admin_roles (code, name, description, is_system_role, created_at) VALUES
  ('COMPANY_ADMIN',     'Company Admin',     'Manage own company details and generate invoices', TRUE, NOW()),
  ('INVOICE_GENERATOR', 'Invoice Generator', 'Generate invoices for assigned company',           TRUE, NOW())
ON CONFLICT (code) DO NOTHING;

-- Assign ALL new permissions to SUPER_ADMIN
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN'
  AND p.function_code IN (
      'COMPANY_MANAGEMENT','COMPANY_DETAILS',
      'INVOICE_TEMPLATE','INVOICE_FORM',
      'INVOICE_GENERATE','INVOICE_HISTORY','INVOICE_VOID'
  )
ON CONFLICT DO NOTHING;

-- COMPANY_ADMIN permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN permissions p
WHERE r.code = 'COMPANY_ADMIN'
  AND (
      (p.function_code = 'COMPANY_DETAILS'  AND p.action IN ('VIEW','UPDATE')) OR
      (p.function_code = 'INVOICE_TEMPLATE' AND p.action IN ('VIEW')) OR
      (p.function_code = 'INVOICE_FORM'     AND p.action IN ('VIEW','CREATE','UPDATE','DELETE')) OR
      (p.function_code = 'INVOICE_GENERATE' AND p.action IN ('VIEW','CREATE')) OR
      (p.function_code = 'INVOICE_HISTORY'  AND p.action IN ('VIEW','EXPORT')) OR
      (p.function_code = 'INVOICE_VOID'     AND p.action IN ('DELETE'))
  )
ON CONFLICT DO NOTHING;

-- INVOICE_GENERATOR permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
CROSS JOIN permissions p
WHERE r.code = 'INVOICE_GENERATOR'
  AND (
      (p.function_code = 'INVOICE_GENERATE' AND p.action IN ('VIEW','CREATE')) OR
      (p.function_code = 'INVOICE_HISTORY'  AND p.action IN ('VIEW'))
  )
ON CONFLICT DO NOTHING;
