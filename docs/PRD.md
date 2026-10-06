# PRD: Campus Equipment Booking API

**Status:** Phases 1 and 2 complete; the first API version runs on local D1. Phase 3 review is next. Unchecked items represent work still to complete.  
**Source requirements:** [Exam brief](exam_brief_en.md) and [grading rubric](rubric_en.md).  
**Target:** A runnable backend in this folder for the 120-minute practical exam.

## 1. Product goal

Allow campus users to discover shared equipment and create, view, update, and delete reservations. Prevent overlapping bookings for the same equipment and provide understandable JSON errors.

Success means the API follows the supplied contract, stores data reliably, passes documented HTTP tests, and includes all submission evidence. Frontend appearance is not assessed.

## 2. Scope and implementation assumptions

- The user confirmed TypeScript + Hono + local Cloudflare D1. Use Wrangler for local development. Any subsequently supplied instructor starter must be reconciled with this setup.
- Proposed local base URL: `http://localhost:8787/api`. Record the actual URL in test evidence.
- No instructor starter code is present or supplied. The user selected the proposed stack; Phase 2 can scaffold locally on that basis. Record the missing starter and incorporate it if the instructor supplies one later.
- Equipment has a read-only listing endpoint and at least two seeded records. Equipment CRUD is outside the required scope.
- Booking CRUD, validation, parameterized SQL, documentation, and HTTP test evidence are required.
- Authentication, notifications, deployment, recurring bookings, and a browser UI are outside this implementation scope.
- A browser client is optional; enable CORS only if implementing one.

The following choices resolve details not explicitly settled by the exam brief and must be documented in the final API contract:

- Use server-generated unique string IDs for bookings.
- Require all five payload fields on creation. `borrowerName` and `purpose` must be non-empty strings after trimming.
- Accept valid ISO 8601 timestamps with an explicit timezone and normalize them to UTC. Store a comparable representation, such as integer epoch milliseconds; return UTC ISO strings.
- Treat intervals as half-open: `[startAt, endAt)`. Adjacent reservations are allowed.
- Support partial `PATCH`: merge supplied fields with the existing booking, then validate the entire result. Full payloads must also work. Reject an empty patch or unknown fields with `400`.
- Return `400` for an invalid or nonexistent `equipmentId` in a payload; return `404` for a missing booking addressed by its URL.
- Return JSON arrays for equipment and booking lists, including `[]` when no bookings exist.

## 3. API requirements

All paths below are relative to the base URL.

| Method | Path | Successful response | Required behavior |
|---|---|---|---|
| GET | `/equipment` | `200`, equipment array | List at least two seeded equipment records |
| GET | `/bookings` | `200`, booking array | List stored bookings |
| GET | `/bookings/:id` | `200`, booking object | Return one booking; missing ID returns `404` |
| POST | `/bookings` | `201`, created booking | Validate and save a non-conflicting reservation |
| PATCH | `/bookings/:id` | `200`, updated booking | Validate merged values; exclude the current booking from conflict checks |
| DELETE | `/bookings/:id` | `204`, empty body | Remove an existing booking; missing ID returns `404` |

### Booking payload and response

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Every booking response includes `id` and all five payload fields. Equipment responses include `id`, `name`, and `location`.

### Error contract

```json
{ "error": "A message understandable to a user or developer" }
```

| Status | Meaning | Example |
|---|---|---|
| 400 | Missing or invalid request data | Invalid timestamps, malformed JSON, unknown equipment, start not before end |
| 404 | Resource not found | Requested booking does not exist |
| 409 | Booking conflict | Same equipment already reserved during the requested interval |
| 500 | Unexpected internal failure | Generic JSON error without database details or stack traces |

- [ ] Match every endpoint, success status, and response shape above.
- [ ] Return `application/json` for responses with JSON bodies.
- [ ] Handle malformed JSON and unexpected failures through the same JSON error contract.
- [ ] Document assumptions and explain the distinction between `400`, `404`, and `409`.

## 4. Data model and booking rules

### Proposed schema

| Table | Field | Storage | Constraint |
|---|---|---|---|
| equipment | id | TEXT | Primary key |
| equipment | name | TEXT | Required |
| equipment | location | TEXT | Required |
| bookings | id | TEXT | Primary key |
| bookings | equipmentId | TEXT | Required foreign key to equipment.id |
| bookings | borrowerName | TEXT | Required, non-empty after trimming |
| bookings | startAt | INTEGER | Required epoch milliseconds |
| bookings | endAt | INTEGER | Required epoch milliseconds; greater than startAt |
| bookings | purpose | TEXT | Required, non-empty after trimming |

Relationship: **one equipment record has many bookings; each booking belongs to one equipment record.**

Suggested seed records:

| id | name | location |
|---|---|---|
| eq-1 | Projector A | Building 1 |
| eq-2 | Camera A | Building 2 |

Two intervals overlap when they belong to the same equipment and:

```text
existing.startAt < requested.endAt
AND existing.endAt > requested.startAt
```

On updates, exclude the booking being edited. A booking ending at 11:00 and another starting at 11:00 are allowed. Reservations for different equipment may overlap.

- [ ] Create reproducible schema migrations and seed at least two equipment records.
- [ ] Enable foreign-key enforcement and a database check that start is before end.
- [ ] Add an index supporting equipment/time conflict queries.
- [ ] Validate payload types, required fields, timestamps, and equipment existence.
- [ ] Check conflicts on creation and updates, including changes to equipment.
- [ ] Use bound parameters for all request-derived SQL values.
- [ ] Keep conflict checking and saving consistent under concurrent writes using the chosen database's supported transaction or atomic-write strategy; document and verify it.
- [ ] Confirm bookings persist across an application restart.
- [ ] Write a brief schema or ERD explaining field types and relationships.

## 5. Implementation checklist

### Phase 1 — Read and design: minutes 0–10

- [x] Confirm the instructor's starter repository and runtime requirements (no starter supplied; user confirmed the proposed stack).
- [x] Record assumptions and the chosen local database/runtime.
- [x] Write `API_CONTRACT.md` before implementation.
- [x] Write `SCHEMA.md` or an equivalent schema/ERD section in the README.
- [x] Start `AI_LOG.md`, including assistance used to create this PRD.

Phase 1 evidence: [API contract](API_CONTRACT.md), [schema design](SCHEMA.md), and [AI log](AI_LOG.md). The folder inspection found no starter code, `quality_gate.md`, or `curl_test_guide.md`. On 2026-10-06 the user confirmed TypeScript + Hono + local D1; Wrangler is the planned local development tool. This confirms the project choice, not instructor approval of a replacement starter. This planning work is not a timed first-version snapshot or runtime test evidence.

### Phase 2 — First version: minutes 10–30

- [x] Scaffold TypeScript/Hono and local D1 using the confirmed stack (no instructor starter supplied).
- [x] Add install, development, migration, and seed commands.
- [x] Implement the equipment listing and all booking CRUD routes.
- [x] Add validation, conflict handling, bound SQL, and JSON error handling.
- [x] Run an initial create/read smoke check (34 HTTP cases passed, plus restart persistence).
- [x] Commit the first version before Quality Gate improvements; actual capture details are in `PHASE_2_SNAPSHOT.md`. This session was not an exam clock; minute 30 is not claimed.

Phase 2 evidence: [run instructions](README.md), [HTTP results](TEST_EVIDENCE.md), and [snapshot record](PHASE_2_SNAPSHOT.md). All Markdown artifacts are in `docs`; project commands run from its parent. Functional checklist items elsewhere are retained for final review. Direct foreign-key rejection and unexpected-error fault injection remain dedicated review checks.

### Phase 3 — Quality Gate improvements: minutes 30–90

- [ ] Review the first version using the instructor-provided Quality Gate.
- [ ] Record at least three actual findings in `QUALITY_GATE_REVIEW.md`.
- [ ] Include at least one Reliability/Accuracy finding and one Reasoning/You Own It finding.
- [ ] Fix each finding and record verifiable evidence of the result.
- [ ] Review create/update overlap edge cases, malformed requests, SQL binding, and explanations of key decisions.
- [ ] Update documentation and AI records as changes are made.

### Phase 4 — Tests and evidence: minutes 90–110

- [ ] Execute HTTP tests with `curl` or another HTTP client.
- [ ] Save request details, expected and actual status/body, and pass/fail results.
- [ ] Record the actual base URL, database setup, and test sequence.
- [ ] Produce a short results summary with any remaining limitations.

### Phase 5 — Submission: minutes 110–120

- [ ] Verify the README can reproduce installation, database setup, startup, and tests.
- [ ] Check every deliverable in section 7.
- [ ] Explain HTTP status choices, data relationships, SQL binding, and the overlap condition independently.
- [ ] Explain at least one AI suggestion accepted or changed and how it was verified.

## 6. Acceptance tests

The rubric requires at least five evidenced cases covering CRUD and errors. Execute the matrix below to demonstrate the important boundary cases too. These are planned tests, not completed evidence.

| Done | Case | Expected result |
|---|---|---|
| [ ] | List equipment | `200`; at least two records with id, name, location |
| [ ] | Create a valid booking | `201`; generated id and complete booking fields |
| [ ] | List and fetch the created booking | `200`; saved values match the request |
| [ ] | Update a booking's purpose without changing its times | `200`; no conflict with itself |
| [ ] | Delete the booking, then fetch it | `204` with empty body, followed by JSON `404` |
| [ ] | Missing field, wrong type, or malformed JSON | JSON `400`; no booking saved |
| [ ] | Unknown equipment ID | JSON `400`; no booking saved |
| [ ] | Invalid timestamp or start greater than/equal to end | JSON `400`; no booking saved |
| [ ] | Fetch, patch, and delete nonexistent booking IDs | JSON `404` for each operation |
| [ ] | Create identical, partially overlapping, contained, and enclosing intervals on the same equipment | JSON `409` for each conflict |
| [ ] | Update time or equipment to conflict with another booking | JSON `409`; original booking remains intact |
| [ ] | Create reservations touching an existing start/end boundary | `201`; adjacent intervals allowed |
| [ ] | Create overlapping times on different equipment | `201`; equipment reservations are independent |
| [ ] | Input containing an apostrophe or SQL-like text | Treated as data; schema and other records remain intact |
| [ ] | Restart after saving a booking | Saved booking remains readable |
| [ ] | Submit two concurrent conflicting creates | One succeeds, the other conflicts; no overlapping records stored |

Keep dependent tests in order, record IDs returned by creation, and use a reproducible database reset/seed process.

## 7. Deliverables and rubric mapping

Suggested filenames below make submission evidence easy to locate; the exam permits the API contract and schema to be README sections.

| Done | Deliverable | Required content | Rubric connection |
|---|---|---|---|
| [ ] | Runnable source and package/config files | Complete CRUD, validation, JSON errors, SQL binding | Implementation/security: 25 points |
| [ ] | Migrations and seed data | Relationship, types, constraints, at least two equipment records | Data design/business rules: 20 points |
| [ ] | `README.md` | Prerequisites, install/setup/run/test commands, local API URL | Runnable implementation and reproducible evidence |
| [ ] | `API_CONTRACT.md` or README section | Endpoints, examples, statuses, assumptions | API contract/analysis: 20 points |
| [ ] | `SCHEMA.md` or README section | Brief schema or ERD with relationship and storage choices | Data design/business rules: 20 points |
| [ ] | `TEST_EVIDENCE.md` and HTTP requests/output | At least five cases covering CRUD, validation, not found, conflict; actual base URL | Testing/evidence: 15 points |
| [ ] | Initial snapshot | Commit or screenshot of the first version at minute 30 | Quality Gate improvement: 10 points |
| [ ] | `QUALITY_GATE_REVIEW.md` | At least three findings → fixes → evidence; required review categories | Quality Gate improvement: 10 points |
| [ ] | `AI_LOG.md` | Important prompts, responses used, personal verification, explanation of decisions | AI responsibility/You Own It: 10 points |

### Evidence templates

For each Quality Gate finding:

```text
Category:
What I found:
How I fixed it:
Verification evidence:
Related code/test/commit:
```

For each important AI interaction:

```text
Date/time:
Prompt or prompt summary:
What I used or changed:
What I verified myself:
Decision I can explain:
```

Only mark checks complete after the corresponding work or evidence exists. Do not invent test results, personal verification, review findings, or an earlier snapshot.

## 8. Dependencies and definition of done

The source exam brief references `curl_test_guide.md` and `quality_gate.md`; neither is currently in this folder. Obtain the instructor's materials when provided. This PRD's acceptance matrix helps plan testing but does not replace the official Quality Gate checklist.

- [ ] Required starter and instructor materials have been incorporated, or their absence is clearly recorded.
- [ ] All six required API endpoints work with the documented contract.
- [ ] Creation and updates enforce booking rules and preserve valid existing data on failure.
- [ ] Required HTTP evidence demonstrates CRUD and `400`, `404`, and `409` responses.
- [ ] All submission artifacts and the genuine first-version snapshot exist.
- [ ] At least three meaningful Quality Gate improvements have verified evidence.
- [ ] AI assistance is transparently recorded and the student can explain the implementation.
- [ ] A fresh setup following the README runs successfully in the required course environment.
