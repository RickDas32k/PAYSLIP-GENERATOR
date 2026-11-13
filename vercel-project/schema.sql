-- Tables are also created/upgraded automatically by api/employees.js on the first request.
-- Only run this manually if you want to set up by hand. The Vercel Query tab runs ONE statement
-- at a time, so paste each statement separately (or use `npm run migrate`).

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT,
  employee_id TEXT,
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE employees ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS employees_employee_id_idx ON employees (employee_id);

CREATE INDEX IF NOT EXISTS employees_name_idx ON employees (name);

CREATE INDEX IF NOT EXISTS employees_category_idx ON employees (category);

CREATE TABLE IF NOT EXISTS salary_slips (
  id TEXT PRIMARY KEY,
  employee_name TEXT,
  month TEXT,
  net_pay NUMERIC,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS salary_slips_created_idx ON salary_slips (created_at DESC);
