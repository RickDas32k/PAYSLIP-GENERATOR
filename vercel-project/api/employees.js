import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { rows } = await sql`
        SELECT id, name, designation, employee_id AS "employeeId"
        FROM employees
        ORDER BY name ASC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { name, designation, employeeId } = req.body || {};
      if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
      }

      // Upsert by employeeId when one is provided, so re-importing the
      // same spreadsheet updates existing staff instead of duplicating them.
      if (employeeId) {
        const existing = await sql`
          SELECT id FROM employees WHERE employee_id = ${employeeId} LIMIT 1
        `;
        if (existing.rows.length) {
          const id = existing.rows[0].id;
          await sql`
            UPDATE employees
            SET name = ${name}, designation = ${designation || ''}, updated_at = now()
            WHERE id = ${id}
          `;
          return res.status(200).json({ id, name, designation, employeeId, updated: true });
        }
      }

      const id = randomUUID();
      await sql`
        INSERT INTO employees (id, name, designation, employee_id)
        VALUES (${id}, ${name}, ${designation || ''}, ${employeeId || ''})
      `;
      return res.status(200).json({ id, name, designation, employeeId, updated: false });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { name, designation, employeeId } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id is required' });
      await sql`
        UPDATE employees
        SET name = ${name}, designation = ${designation || ''}, employee_id = ${employeeId || ''}, updated_at = now()
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
