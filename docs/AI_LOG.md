# AI Assistance Log

This log records AI assistance used in this project. Entries dated **2026-10-06 (Asia/Bangkok)** are reconstructed from this chat; precise interaction times were not recorded. Agent checks below are distinct from the student's personal verification.

## Entry 1 — Understanding the exam documents

**Prompt summary:** Explain the two Markdown files briefly.  
**Assistance:** Codex read `exam_brief_en.md` and `rubric_en.md`, summarized the booking API assignment and grading criteria, and identified missing referenced guides.  
**Used output:** The explanation informed project planning. No code was generated.  
**Agent verification:** Read both source documents and listed the folder contents.  
**Student verification:** Pending; the student should compare the summary with the original documents.  
**Decision to explain:** Why CRUD, overlap prevention, testing evidence, and AI ownership all matter to the submission.

## Entry 2 — Creating the PRD

**Prompt summary:** Create a PRD Markdown file with task checklists and deliverables based on the exam and rubric.  
**Assistance:** Codex created `PRD.md` with phases, API requirements, a proposed schema, acceptance tests, and rubric mapping.  
**Used output:** The PRD is the implementation plan. Partial PATCH, timestamp normalization, adjacent bookings, and unknown-equipment handling are explicit design assumptions.  
**Agent verification:** Compared required endpoints, statuses, deliverables, review categories, and point allocations with the source documents; checked that the file was saved. No API was run.  
**Student verification:** Pending; review the PRD and explain or adjust its assumptions.  
**Decision to explain:** Which behaviors come from the instructor and which were chosen to resolve ambiguity.

## Entry 3 — Phase 1 design

**Prompt summary:** Start Phase 1 from the PRD and ask for needed information.  
**Assistance:** Codex inspected the folder, requested starter/runtime information, and authored `API_CONTRACT.md`, `SCHEMA.md`, and this AI log before implementation.  
**Used output:** The API contract defines request/response behavior; the schema explains relationships, timestamp storage, and planned conflict enforcement.  
**Agent verification:** Cross-checked the design against the exam and rubric. Confirmed no starter code or instructor guides were present. Runtime behavior, migrations, and database concurrency are not yet tested.  
**User confirmation:** The user selected “Use TypeScript + Hono + local D1.” No starter repository was supplied. Wrangler is the planned local development tool.  
**Student verification:** Pending; review the documents and explain the overlap condition and HTTP errors. Stack selection does not demonstrate personal verification of the design or code.  
**Decision to explain:** Why updates exclude their own ID from conflicts, why adjacent intervals are allowed, and why checking availability separately from saving is insufficient for concurrent writes.

## Entry 4 — Phase 2 implementation and document organization

**Date:** 2026-10-06 (Asia/Bangkok).  
**Prompt summary:** Move all Markdown files into `docs` and start Phase 2 implementation.  
**Assistance:** Codex moved the documents and implemented Hono routes, validation, local D1 configuration, schema/seeds, an HTTP test runner, run instructions, and snapshot tooling.  
**Used output:** Source code, SQL, scripts, and documentation in this project. Database triggers were chosen to enforce overlap prevention at the write boundary.  
**Agent verification:** `npm run typecheck` passed; local migration and seeding passed; all 34 HTTP cases passed, including create/update conflicts and concurrent requests; a booking remained readable after stopping and restarting Wrangler. Actual results are in `TEST_EVIDENCE.md`. Dependencies installed with zero reported vulnerabilities. The initially assumed workers-types version did not exist; the published version 5.20261006.1 was selected and installed.  
**Student verification:** Pending; run the documented commands and explain the routes, timestamp checks, parameter binding, and trigger rules. No personal verification is claimed.  
**Sources consulted:** Official Hono Workers and Cloudflare local D1/migration documentation linked in `README.md`.  
**Snapshot:** A first-version commit/source copy is captured at the actual completion time; no claim of exam minute 30.

## Entry 5 — Phase 3 professor Quality Gate

**Date:** 2026-10-06 (Asia/Bangkok).  
**Prompt summary:** Two professor-provided Markdown files were added; proceed with Phase 3.  
**Assistance:** Codex read both supplied guides and the implementation, identified gaps in field assertions, database/failure evidence, report retention, and explanation support, then improved tests and documentation. Five findings/actions/evidence are recorded in `QUALITY_GATE_REVIEW.md`.  
**Used output:** Stronger HTTP assertions, isolated local D1 constraint checks, injected Hono error-handler checks, archived PASS/FAIL reports, and an implementation explanation/personal exercise guide.  
**Agent verification:** TypeScript passed; 39 HTTP cases passed; three isolated D1 constraint checks passed with zero invalid saved rows; three error-mapping checks passed. Guide explanations were compared with code, migrations, contract, and professor materials.  
**Student verification:** Pending. The Reasoning/You Own It improvement provides study and exercise material; no independent student explanation is claimed.  
**Decision to explain:** Why a passing status does not prove field accuracy; why database constraints need direct verification; why injected fault tests differ from live HTTP evidence.  
**Limitation recorded:** Concurrent same-booking partial edits have no version check; deployment is unverified. The initial snapshot remains `e5fdb85`.

## Entry 6 — Phase 4 final tests and evidence

**Date:** 2026-10-06 (Asia/Bangkok).

**Prompt summary:** Proceed with Phase 4 and ask if information is needed.

**Assistance:** Codex verified installation/setup in a clean source copy, reran the HTTP/database/error suites, added an actual cURL runner for the professor's nine-step sequence, and wrote the results summary.

**Agent verification:** Clean `npm ci`, migration, seeds, and typecheck passed. The main API passed 39 HTTP cases, three isolated database checks, and three injected-error checks. The clean-copy server on port 8788 passed all nine professor-guide cURL cases; GET bookings after cleanup returned `[]`. The temporary server was stopped; main port 8787 was retained. Raw HTTP evidence and execution timestamps are saved in the linked reports.

**Used output:** `scripts/test-curl.mjs`, `CURL_TEST_EVIDENCE.md`, timestamped evidence archives, `TEST_RESULTS_SUMMARY.md`, and updated checklists/docs.

**Student verification:** Pending. No student personal testing or independent explanation is claimed.

**Decision to explain:** Why tests use an isolated database and alternate port, why raw response evidence matters, and how status/field assertions differ from personal understanding.

## Entry 7 — Consistent local API URL

**Date:** 2026-10-06 (Asia/Bangkok).

**Prompt summary:** Make ports consistent because some test URLs used a stopped temporary server.

**Assistance:** Codex standardized both HTTP runners on `http://127.0.0.1:8787/api` via `scripts/config.mjs`, removed environment overrides, corrected current run documentation, and refreshed cURL/HTTP reports by running them on the main server. Historical reports retain their original URLs for auditability.

**Agent verification:** All nine cURL cases and all 39 HTTP cases passed on port 8787. No application database reset was performed.

**Student verification:** Pending. Manual tests should use IDs from newly created bookings, as automated test bookings are deleted during cleanup.

## Entry 9 — GitHub and Cloudflare publication

Date: 2026-10-06 (Asia/Bangkok). The user requested publishing source to GitHub and deploying the API, and explicitly chose a new public repository. The user completed GitHub CLI and Wrangler OAuth authorization.

Codex installed GitHub CLI, prepared deployment scripts, created a dedicated remote D1 database, applied its migration and seeds, and deployed the Worker. The public API is https://campus-equipment-booking-api.svg-asset.workers.dev/api. Cloudflare deployment version: `381961fc-337d-43cb-8c24-ad6fb54109bd`.

Agent verification: TypeScript and Wrangler dry-run passed. All 39 HTTP cases and nine cURL cases passed against the public API; results are in TEST_EVIDENCE.md. Local database setup was also reapplied for the configured database ID. Local and remote databases remain separate. No tokens or login credentials were written into source files.

Source repository: https://github.com/Nadizeya/campus-equipment-booking-api. Existing first-version commit `e5fdb85` is preserved in the published history. Student personal explanation remains pending; publication does not demonstrate independent understanding.

## Future entry template (copy for later work)

```text
Date/time and timezone:
Important prompt or prompt summary:
AI suggestion:
What I used, rejected, or changed:
What the agent checked:
What I verified myself (commands, results, or explanation):
Related files/tests/commits:
Decision I can explain:
```

Update this log for significant implementation and debugging assistance. Record personal verification only after doing it; keep actual outputs in the relevant evidence files.


## Entry 8 — Submission document cleanup

Date: 2026-10-06 (Asia/Bangkok). The user approved removal of unnecessary submission files. Codex consolidated results and raw evidence into TEST_EVIDENCE.md, moved explanations and snapshot details into README.md, fixed links, and removed handouts, planning documents, and duplicate reports from docs. Test runners now update only their own consolidated evidence section. Earlier filenames in this log describe historical artifacts. Student personal verification remains pending.
