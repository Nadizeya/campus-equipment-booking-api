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
