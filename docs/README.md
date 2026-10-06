# Campus Equipment Booking API

TypeScript + Hono + local Cloudflare D1. This project runs locally with Wrangler; the configured database ID is a local placeholder. No Cloudflare account or remote database is required for these commands.

## Run locally

Prerequisite: Node.js 22 or newer and npm. This version was developed with Node.js 24.

From the project root (the parent of this `docs` folder):

```powershell
npm ci
npm run db:setup
npm run typecheck
npm run dev
```

API base URL: `http://127.0.0.1:8787/api`. Open another terminal for testing:

```powershell
curl.exe -i http://127.0.0.1:8787/api/equipment
npm run test:http
```

`test:http` tests real HTTP requests against the running local server and writes `docs/TEST_EVIDENCE.md`. It creates and cleans up its own bookings on 2036-10-20/21. Use a clean database or leave those dates unreserved. It does not delete unrelated bookings.

Database files persist under `.wrangler/state`. Restarting `npm run dev` preserves data. Migrations are versioned in `migrations`; equipment seeds are idempotent. To reset test bookings deliberately, stop the server and run:

```powershell
npx wrangler d1 execute campus-booking --local --command "DELETE FROM bookings"
```

This command deletes all local bookings; it is not necessary for ordinary startup.

## Layout

| Location | Purpose |
|---|---|
| `src/index.ts` | Six API routes and JSON error handling |
| `src/validation.ts` | Payload, calendar timestamp, and chronology validation |
| `migrations/0001_initial.sql` | Schema, index, and insert/update overlap triggers |
| `seeds/equipment.sql` | Two initial equipment records |
| `scripts/test-http.mjs` | HTTP verification and actual evidence output |
| `scripts/snapshot.mjs` | Local source snapshot, excluding dependencies/database |
| `docs/` | Exam sources, design, AI log, and verification evidence |

See [API contract](API_CONTRACT.md), [schema](SCHEMA.md), [PRD checklist](PRD.md), and [AI log](AI_LOG.md).

## Key decisions

Times are validated as calendar timestamps, stored as integer UTC milliseconds, and returned in UTC ISO format. Overlap uses strict comparisons so touching intervals are allowed. SQLite triggers enforce conflicts at the write boundary for both creation and updates; updates exclude their own ID. All user data is passed through bound SQL parameters.

## First-version snapshot

Run `npm run snapshot` to copy source/configuration/docs into `snapshots/` with the actual capture time. Snapshots are excluded from Git. This folder started without a Git repository; a local repository and first-version commit now capture Phase 2. See [snapshot record](PHASE_2_SNAPSHOT.md). Neither the commit nor the source copy claims capture at exam minute 30.

## Remaining exam work

The instructor's starter, Quality Gate checklist, and cURL guide have not been supplied. Phase 3 must record actual review findings, fixes, and verification. Student personal verification and explanation remain pending in the AI log. This project currently targets local development only.

Runtime references: [Hono on Workers](https://hono.dev/docs/getting-started/cloudflare-workers), [local D1 development](https://developers.cloudflare.com/d1/best-practices/local-development/), and [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).
