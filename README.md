# Halieutis Club website

The Halieutis Club (FST Tanger) website: a public one-page site with a contact
form, and an admin dashboard that lists the messages received.

## Architecture

```
Browser ──▶ Next.js on Vercel ──▶ Cloudflare Worker ──▶ Cloudflare D1
            (server action,        (cloudflare/worker)    (halieutis-submissions)
             dashboard page)
                  │
                  ├──▶ Supabase Auth   admin login only
                  └──▶ Resend          email notification for each new message
```

- **Website** (`src/`): Next.js 16, deployed on Vercel.
- **Contact form** (`src/components/ContactForm.tsx`): calls the server action
  `submitForm` (`src/app/actions.ts`), which validates the input, stores it
  through the Worker, then emails the club through Resend.
- **Dashboard** (`/dashboard`): protected by Supabase Auth (`src/proxy.ts` and
  the page itself). Once the admin is signed in, the page loads the
  submissions from the Worker on the server.
- **Submissions API** (`cloudflare/worker/`): the only code that touches the
  database. The browser never calls it; only the Next.js server does, with
  one of two bearer tokens:
  - `SUBMIT_API_TOKEN` can only **create** a submission (`POST /submissions`).
  - `ADMIN_API_TOKEN` can **list** submissions (`GET /submissions`). It is
    only sent after the Supabase login check passes.

  The Worker validates every field, uses parameterized SQL only, sends no CORS
  headers, and limits each visitor IP to 5 messages per 10 minutes. It stores
  an HMAC of the IP for that purpose, never the IP itself.
- **Database** (Cloudflare D1, binding `DB`): one table, `submissions`,
  defined by the migrations in `cloudflare/worker/migrations/`.

Supabase stores no submissions any more; it is used only to sign the admin in.

## Environment variables

| Variable | Where | Public? | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel | yes (inlined in the browser bundle) | Supabase Auth |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel | yes (inlined in the browser bundle) | Supabase Auth |
| `SUBMISSIONS_API_URL` | Vercel | **no** | Worker URL, e.g. `https://halieutis-submissions-api.<subdomain>.workers.dev` |
| `SUBMIT_API_TOKEN` | Vercel **and** Worker secret | **no** | lets the site create submissions |
| `ADMIN_API_TOKEN` | Vercel **and** Worker secret | **no** | lets the dashboard list submissions |
| `RESEND_API_KEY` | Vercel | **no** | email notifications |

The two tokens must be different, at least 32 characters, and identical on
both sides. Generate each with `openssl rand -hex 32`. Never give a secret a
`NEXT_PUBLIC_` prefix: that would publish it in the browser bundle.

The Supabase variables are also needed **at build time** (the login page is
prerendered).

## Local development

```bash
npm install
cp .env.example .env.local            # fill in the values

# Submissions API with a local D1 database (second terminal)
cd cloudflare/worker
npm install
cp .dev.vars.example .dev.vars        # same two tokens as in .env.local
npm run db:migrate:local
npm run dev                           # http://127.0.0.1:8787

# Website (first terminal, repo root)
npm run dev                           # http://localhost:3000
```

With `SUBMISSIONS_API_URL=http://127.0.0.1:8787`, the local site writes to the
local D1 database under `cloudflare/worker/.wrangler/`.

Checks: `npm run build` and `npm run lint` at the root, `npm run typecheck` in
`cloudflare/worker`.

## Deploying

### First time: Cloudflare

Run these from `cloudflare/worker/`, logged in with `npx wrangler login`.

1. Create the database:
   ```bash
   npx wrangler d1 create halieutis-submissions
   ```
   Copy the printed `database_id` into `wrangler.jsonc` (it is not a secret)
   and commit it.
2. Create the table:
   ```bash
   npm run db:migrate:remote
   ```
3. Set the two secrets (paste each value when prompted):
   ```bash
   npx wrangler secret put SUBMIT_API_TOKEN
   npx wrangler secret put ADMIN_API_TOKEN
   ```
4. Deploy the Worker, and note the `workers.dev` URL it prints:
   ```bash
   npm run deploy
   ```
5. Check it answers: `curl https://<worker-url>/health` should return `{"ok":true}`.

### First time: Vercel

In Project Settings → Environment Variables, for Production (and Preview if
used), add `SUBMISSIONS_API_URL`, `SUBMIT_API_TOKEN` and `ADMIN_API_TOKEN`,
alongside the existing Supabase and Resend variables. Then redeploy.

### Later changes

- Website: push to `main`; Vercel deploys it.
- Worker: `npm run deploy` in `cloudflare/worker/`.
- Schema: add a new numbered file in `cloudflare/worker/migrations/`, run
  `npm run db:migrate:local` to test it, then take a backup and run
  `npm run db:migrate:remote`. Never edit a migration that has already been
  applied.

## Backups and recovery

Submissions are personal data. Store backups somewhere private, never in this
repository (`cloudflare/worker/backups/` is git-ignored for that reason).

### Export (backup)

```bash
cd cloudflare/worker
npm run db:backup     # writes backups/halieutis-submissions-<UTC time>.sql
```

This is `wrangler d1 export halieutis-submissions --remote --output=<file>`:
a plain SQL file with the schema and every row. Nothing runs it on a schedule,
so take one regularly (for example monthly) and before any schema change.

### Restore from an export

Into a new, empty database (safest), then point `wrangler.jsonc` at it:

```bash
npx wrangler d1 create halieutis-submissions-restore
npx wrangler d1 execute halieutis-submissions-restore --remote --file=backups/<file>.sql
```

The export contains the `CREATE TABLE` statements, so do not run the
migrations on that database first. Importing into the existing database only
works once its `submissions` table has been dropped.

### Time Travel (point-in-time recovery)

D1 keeps a history of every database automatically. It can restore the
database to a point within the last **7 days on the Workers Free plan**
(30 days on Workers Paid):

```bash
npx wrangler d1 time-travel info halieutis-submissions      # current bookmark
npx wrangler d1 time-travel restore halieutis-submissions --timestamp=<unix-seconds>
```

The restore overwrites the whole database in place and prints a bookmark to
undo it. Time Travel covers mistakes such as an accidental delete or a bad
migration within that window. It is not an archive: anything older than the
window only comes back from an export, and it is no substitute for an export
if the database itself is deleted.
