# DPS Gangtok — Salary Slip Generator (online, Vercel + Postgres)

This is the "always-online" version of the salary slip tool: the Employee
Directory and Salary Slip History are stored in a real Postgres database, so
anyone who opens the deployed link sees and edits the same shared data —
no browser storage involved.

```
├── api/
│   ├── employees.js   → GET/POST/PUT/DELETE the employee directory
│   └── slips.js       → GET/POST/DELETE the salary slip history
├── public/
│   └── index.html     → the app itself (form, PDF generation, UI)
├── schema.sql         → run this once against your database
├── package.json
└── vercel.json
```

## 1. Push this project to GitHub

Create a new (private is fine) GitHub repo and push these files to it —
either via the GitHub website's "upload files" or:

```bash
git init
git add .
git commit -m "Salary slip generator"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## 2. Import the project into Vercel

1. Go to vercel.com → **Add New → Project**.
2. Select the GitHub repo you just pushed.
3. Leave the build settings as default (no framework — it's static + API
   routes) and click **Deploy**. It will deploy successfully even before the
   database exists; the app just won't load data yet.

## 3. Create the Postgres database

1. In your new Vercel project, open the **Storage** tab.
2. Click **Create Database → Postgres** (this is Vercel's managed Postgres,
   built on Neon) and follow the prompts.
3. On the **Connect Project** step, connect it to this project — Vercel
   automatically adds the `POSTGRES_URL` and related environment variables
   for you. No copy-pasting connection strings needed.

## 4. Create the tables

1. Still in the Storage tab, open your new database and go to its **Query**
   tab (or connect with any Postgres client using the connection details
   Vercel shows you).
2. Paste in the contents of `schema.sql` from this project and run it. This
   creates the `employees` and `salary_slips` tables.

## 5. Redeploy

Environment variables only take effect on new deployments, so trigger one:
in the **Deployments** tab, click the **⋯** menu on the latest deployment →
**Redeploy**.

## 6. You're live

Open the deployment URL (e.g. `https://your-project.vercel.app`) — this is
now the shared link for anyone at the school to use. Every employee added
and every slip generated is saved to the same Postgres database, visible to
everyone who opens that link.

---

### Notes

- **Local testing (optional):** install the [Vercel CLI](https://vercel.com/docs/cli)
  (`npm i -g vercel`), run `vercel link` then `vercel env pull` to copy the
  database env vars into a local `.env.local`, then `vercel dev` to run it
  on your machine before deploying.
- **Costs:** Vercel's Postgres/Hobby tier has a generous free allowance,
  which is more than enough for a single school's salary slip data. Check
  Vercel's current pricing page if you expect heavy usage.
- **Access control:** this deployment is a public URL — anyone with the
  link can open it and see/edit the employee directory and slip history.
  If you want to restrict it to school staff only, the simplest option is
  turning on Vercel's built-in **Password Protection** or **Vercel
  Authentication** for the project (in Project Settings → Deployment
  Protection); ask me if you'd like help wiring up a proper staff login
  instead.
- The letterhead image is embedded directly in `public/index.html` as
  before, so the PDF output is identical to the standalone version.
