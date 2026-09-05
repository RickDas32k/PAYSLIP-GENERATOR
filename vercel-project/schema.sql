-- Run this once against your Vercel Postgres database before first use.
-- (Vercel dashboard -> your project -> Storage -> your database -> Query tab
-- is the easiest place to paste and run this.)

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT,
  employee_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS employees_employee_id_idx ON employees (employee_id);
CREATE INDEX IF NOT EXISTS employees_name_idx ON employees (name);

CREATE TABLE IF NOT EXISTS salary_slips (
  id TEXT PRIMARY KEY,
  employee_name TEXT,
  month TEXT,
  net_pay NUMERIC,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS salary_slips_created_idx ON salary_slips (created_at DESC);
