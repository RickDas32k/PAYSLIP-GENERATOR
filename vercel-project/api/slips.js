import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { id } = req.query;

      if (id) {
        const { rows } = await sql`SELECT data FROM salary_slips WHERE id = ${id} LIMIT 1`;
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(rows[0].data);
      }

      const { rows } = await sql`
        SELECT id, employee_name AS name, month, net_pay AS net, created_at AS "createdAt"
        FROM salary_slips
        ORDER BY created_at DESC
        LIMIT 300
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const record = req.body;
      if (!record || !record.empName || !record.empMonth) {
        return res.status(400).json({ error: 'Invalid salary slip record' });
      }
      const id = record.id || randomUUID();
      record.id = id;
      record.createdAt = record.createdAt || Date.now();

      await sql`
        INSERT INTO salary_slips (id, employee_name, month, net_pay, data, created_at)
        VALUES (
          ${id}, ${record.empName}, ${record.empMonth}, ${record.net || 0},
          ${JSON.stringify(record)}, to_timestamp(${record.createdAt / 1000})
        )
      `;
      return res.status(200).json({ ok: true, id });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      await sql`DELETE FROM salary_slips WHERE id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
