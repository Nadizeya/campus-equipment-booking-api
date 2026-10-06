# Campus Equipment Booking API

TypeScript + Hono + Cloudflare D1. The API runs locally with Wrangler and is deployed to Cloudflare Workers. Local development uses its own database state and does not require signing in.

## Submission links

- GitHub source: [Nadizeya/campus-equipment-booking-api](https://github.com/Nadizeya/campus-equipment-booking-api).
- Public API base URL: [https://campus-equipment-booking-api.svg-asset.workers.dev/api](https://campus-equipment-booking-api.svg-asset.workers.dev/api).
- Testable equipment endpoint: [GET /api/equipment](https://campus-equipment-booking-api.svg-asset.workers.dev/api/equipment).

The base URL has no standalone GET route; use `/equipment` or `/bookings`. All 39 HTTP cases and nine cURL cases passed on the deployed API; see [deployment evidence](TEST_EVIDENCE.md#deployed-api-http-cases).

## Run locally

## Cloudflare deployment

The Worker uses the `DB` binding to the remote `campus-booking` D1 database. The database ID in `wrangler.jsonc` identifies this submission's database; it is not a secret. Credentials remain in the local CLI credential stores and are not included in Git.

For an authorized Cloudflare account, deploy updates from the project root:

```powershell
npx wrangler login
npm run db:migrate:remote
npm run db:seed:remote
npm run deploy
npm run test:http:remote
npm run test:curl:remote
```

The remote tests create and clean up their own reservations. Local tests still use port 8787; `:remote` commands explicitly target the public URL. Someone deploying into a different Cloudflare account must create their own D1 database with `npx wrangler d1 create campus-booking` and update the database ID in `wrangler.jsonc` first.

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
npm run test:curl
npm run test:db
npm run test:errors
```

`test:http` tests real HTTP requests against the running local server and writes `docs/TEST_EVIDENCE.md`. It creates and cleans up its own bookings on 2036-10-20/21. Use a clean database or leave those dates unreserved. It does not delete unrelated bookings.

All test suites update their own section of [TEST_EVIDENCE.md](TEST_EVIDENCE.md), preserving the other suites. Run them sequentially. `test:db` uses an isolated local database; `test:errors` injects D1 failures into the real Hono application. Expected error messages appear during negative tests.

`test:curl` executes the professor's nine-step guide using actual cURL. Leave `eq-1` free on 2026-10-20 when running it. Both HTTP clients use `scripts/config.mjs`: `http://127.0.0.1:8787/api`. A stale BASE_URL environment value cannot redirect them.

Evidence reports contain booking IDs from a completed run; those test bookings are deleted afterward. For manual GET/PATCH/DELETE testing, create a new booking and use its returned ID. A POST requires an HTTP client; entering its URL in the browser address bar sends GET.

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
| `docs/` | Six submission documents |

See [API contract](API_CONTRACT.md), [schema](SCHEMA.md), [AI log](AI_LOG.md), [Quality Gate review](QUALITY_GATE_REVIEW.md), and [test evidence](TEST_EVIDENCE.md).

## Key decisions

Times are validated as calendar timestamps, stored as integer UTC milliseconds, and returned in UTC ISO format. Overlap uses strict comparisons so touching intervals are allowed. SQLite triggers enforce conflicts at the write boundary for both creation and updates; updates exclude their own ID. All user data is passed through bound SQL parameters.

## First-version snapshot

The local commit named **Phase 2: implement local equipment booking API** captures the first version before Phase 3 improvements. Locate its ID and actual timestamp with:

```powershell
git log --format="%h %aI %s" --all
```

The commit uses the existing Git author configuration. This session was not performed against an exam clock; no claim of capture at minute 30 is made.

Scope: source, migrations, seeds, package/runtime configuration, scripts, exam documents, design, AI log, run instructions, and actual HTTP evidence. Dependencies and local database files are excluded; recreate them with `npm ci` and `npm run db:setup`.

Before capture, TypeScript checks, local migration/seeding, and 34 HTTP cases passed. A separate restart check verified persistence. Test bookings were removed afterward.

An additional source copy was captured under `snapshots/`; its `SNAPSHOT.txt` records the capture time. The first-version Git commit remains the primary review reference. Phase 3 review and Phase 4 testing are now complete.

## Remaining exam work

The professor's [Quality Gate](README.md#assignment-sources) and [cURL guide](README.md#assignment-sources) have been incorporated. Phases 1–4 are complete for agent implementation/review/testing. No instructor starter was supplied. Phase 5 and student personal verification/explanation remain pending. The API is also deployed and verified on Cloudflare Workers.

Runtime references: [Hono on Workers](https://hono.dev/docs/getting-started/cloudflare-workers), [local D1 development](https://developers.cloudflare.com/d1/best-practices/local-development/), and [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/).


## Assignment sources

This submission was prepared from the professor's exam brief, 100-point rubric, Quality Gate, and cURL quick-test guide. The original handouts and planning PRD were removed from the submission folder at the user's request after requirements, review categories, and test coverage were preserved here. The original exam brief and rubric remain in the first-version Git commit `e5fdb85`.

## Submission checklist

- [x] GitHub source link: https://github.com/Nadizeya/campus-equipment-booking-api.
- [x] Deployed Cloudflare API link: https://campus-equipment-booking-api.svg-asset.workers.dev/api.

- [x] Runnable API source and setup instructions.
- [x] API contract and schema.
- [x] Transparent AI log.
- [x] Quality Gate findings, actions, and evidence.
- [x] HTTP evidence with base URL and success/error cases.
- [x] First-version Git snapshot identified.
- [ ] Student personal verification and independent explanation.
- [ ] Final Phase 5 submission review.

## Implementation explanation


This guide addresses Reasoning and You Own It in the professor's [Quality Gate](README.md#assignment-sources). It provides explanations to study and exercises to complete. Reading it does not establish personal understanding; the student must verify the work and explain it independently.

## Follow one request

1. `src/index.ts` registers the six `/api` routes on Hono and reads the local D1 binding as `c.env.DB`.
2. POST parses JSON, then `src/validation.ts` checks object shape, allowed fields, strings, calendar timestamps, and start/end order.
3. `requireEquipment` queries the equipment table with a bound ID. Unknown equipment is invalid request data (`400`).
4. POST inserts a server-generated UUID and the validated values. `.bind(...)` passes user values separately from SQL structure.
5. `migrations/0001_initial.sql` checks overlap inside a database trigger. A conflicting write aborts and the error handler maps its known marker to `409`.
6. The response converts stored epoch milliseconds to UTC ISO strings and returns the saved booking with `201`.

SQL strings interpolate a constant column list only. Request values are bound parameters, including IDs supplied in URLs. The SQL-like borrower name in the HTTP test is stored as ordinary text.

## Explain the statuses

| Code | Meaning here | Example |
|---|---|---|
| 200 | Read or update succeeded | GET one booking; PATCH an existing booking |
| 201 | New resource created | POST a valid, non-conflicting booking |
| 204 | Delete succeeded; no response body | DELETE an existing booking |
| 400 | Request data is invalid | Missing fields, malformed JSON, nonexistent equipment, reversed times |
| 404 | Addressed resource is absent | GET/PATCH/DELETE a missing booking |
| 409 | Valid requested interval conflicts with saved state | Reserve already-booked equipment |
| 500 | Unexpected internal failure | D1 unexpectedly fails; client sees a generic error |

## Explain overlap and updates

Overlap requires the same equipment and both `existing.startAt < requested.endAt` and `existing.endAt > requested.startAt`.

For an existing 09:00–11:00 interval, 10:00–12:00 overlaps because 09:00 < 12:00 and 11:00 > 10:00. An 11:00–12:00 booking is allowed because 11:00 > 11:00 is false. This is the half-open interval assumption.

An update trigger excludes the row's own ID; otherwise unchanged times would conflict with the row being edited. PATCH merges supplied values with existing values, validates the complete result, and saves it. Conflicting writes abort without changing the booking.

## Required behavior versus chosen behavior

The professor requires the endpoints, booking fields, seeded equipment, chronological validation, overlap prevention, parameter binding, JSON errors, and submission evidence. UUID IDs, partial PATCH, UTC normalization, adjacent bookings, list ordering, and rejection of unknown fields are documented design choices. The professor's full-payload PATCH example is supported too.

No future-only rule, authentication, equipment CRUD, or frontend is required. CORS is only necessary if a browser client is added. Navigating to a GET endpoint in a browser is not a cross-origin client application.

## Limits to explain

- The API is deployed on Cloudflare Workers with a dedicated remote D1 database; 48 deployed HTTP/cURL cases passed. Authentication is not implemented, so the submission API is publicly accessible.
- No instructor starter was supplied; the user selected the exam-compatible stack.
- Concurrent overlapping creates are tested. Simultaneous partial edits of the same booking can still overwrite values read earlier; there is no version-based edit protection. This is outside the supplied concurrency requirements and should be disclosed.
- Error-handler fault tests inject a D1 failure into the real Hono app; they do not simulate a live database outage.
- The initial commit was captured at the actual development time, not a measured exam minute 30.

## Student verification checklist

Leave these unchecked until personally completed. Record commands, observations, and explanations in the AI log.

- [ ] Run installation/setup/startup using `README.md`.
- [ ] Execute the professor's cURL sequence or equivalent HTTP requests and identify the returned booking ID.
- [ ] Explain how POST and PATCH reach validation, D1, and the conflict trigger.
- [ ] Explain all three of `400`, `404`, and `409` with examples.
- [ ] Calculate one overlapping case and one touching-boundary case without using AI.
- [ ] Point to a bound query and explain why SQL-like text cannot become SQL structure.
- [ ] Explain the difference between actual runtime evidence, injected fault tests, and personal verification.
- [ ] Explain one accepted AI suggestion, one design limitation, and what improved during Phase 3.

The professor's cURL guide uses Bash syntax. On Windows use `curl.exe` to avoid aliases, or use a Bash terminal. In PowerShell use `$BASE_URL = 'http://127.0.0.1:8787/api'` and `$BOOKING_ID = 'returned-id'`; do not paste Bash backslash continuations directly. JSON payloads can be saved to a file and sent with `curl.exe -i -X POST "$BASE_URL/bookings" -H "Content-Type: application/json" --data-binary "@payload.json"`.
