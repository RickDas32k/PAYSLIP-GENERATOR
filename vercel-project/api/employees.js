import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';

const CATEGORIES = ['Teacher', 'Admin', 'Nannies', 'Transport'];
const cleanCategory = (c) => (CATEGORIES.includes(c) ? c : '');

// Creates the table / adds the category column automatically on first request,
// so no manual SQL is needed when upgrading an existing database.
let schemaReady = null;
function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        designation TEXT,
        employee_id TEXT,
        category TEXT,
        updated_at TIMESTAMPTZ DEFAULT now()
      )`;
      await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS category TEXT`;
    })().catch((e) => { schemaReady = null; throw e; });
  }
  return schemaReady;
}

export default async function handler(req, res) {
  try {
    await ensureSchema();

    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, name, designation, employee_id AS "employeeId", category
        FROM employees
        ORDER BY name ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, designation, employeeId } = req.body || {};
      const category = cleanCategory((req.body || {}).category);
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Upsert by employeeId so re-importing a sheet updates instead of duplicating.
      // An empty category never overwrites an existing one.
      if (employeeId) {
        const existing = await sql`
          SELECT id FROM employees WHERE employee_id = ${employeeId} LIMIT 1
        `;
        if (existing.rows.length) {
          const id = existing.rows[0].id;
          await sql`
            UPDATE employees
            SET name = ${name},
                designation = ${designation || ''},
                category = COALESCE(NULLIF(${category}, ''), category),
                updated_at = now()
            WHERE id = ${id}
          `;
          return res.status(200).json({ id, name, designation, employeeId, category, updated: true });
        }
      }

      const id = randomUUID();
      await sql`
        INSERT INTO employees (id, name, designation, employee_id, category)
        VALUES (${id}, ${name}, ${designation || ''}, ${employeeId || ''}, ${category})
      `;
      return res.status(200).json({ id, name, designation, employeeId, category, updated: false });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, designation, employeeId } = req.body || {};
      const category = cleanCategory((req.body || {}).category);
      if (!id) return res.status(400).json({ error: 'id is required' });
      await sql`
        UPDATE employees
        SET name = ${name}, designation = ${designation || ''}, employee_id = ${employeeId || ''},
            category = ${category}, updated_at = now()
        WHERE id = ${id}
      `;
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      await sql`DELETE FROM employees WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
