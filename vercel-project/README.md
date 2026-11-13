# DPS Gangtok — Salary Slip Generator (Vercel + Postgres)

Upload the contents of this folder as `vercel-project/` in your GitHub repo, set Vercel → Settings → General → **Root Directory = `vercel-project`**, then redeploy.

- `api/employees.js` creates the `employees` table and the new `category` column automatically on first use (no manual SQL needed).
- `api/slips.js` + `schema.sql` — create `salary_slips` once (Query tab = one statement at a time, or `npm run migrate`).
- Categories: Teacher, Admin, Nannies, Transport. Excel/CSV import columns: Name, Designation, Employee ID, Category.
