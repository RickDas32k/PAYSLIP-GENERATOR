// Runs schema.sql one statement at a time (the Vercel Query tab can't run several at once).
// Usage: vercel link && vercel env pull .env.local && npm run migrate
import { createClient } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const schema = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'schema.sql'), 'utf8');
const statements = schema
  .split(';')
  .map((s) => s.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n').trim())
  .filter(Boolean);

if (!process.env.POSTGRES_URL) {
  console.error('POSTGRES_URL not set. Run `vercel link` then `vercel env pull .env.local` first.');
  process.exit(1);
}

const client = createClient();
await client.connect();
for (const stmt of statements) {
  console.log('->', stmt.replace(/\s+/g, ' ').slice(0, 70));
  await client.query(stmt);
}
await client.end();
console.log('Done.');
