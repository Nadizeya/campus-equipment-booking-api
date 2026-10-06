# Test Evidence

API base URL: `http://127.0.0.1:8787/api`.

Consolidated submission report: results summary, 39 HTTP regression cases, nine professor-guide cURL cases, three database constraint cases, and three error-handler cases. Each section retains its actual execution timestamp. Test scripts replace only their own section. Run suites sequentially.


<!-- BEGIN summary -->
## Results summary


**Date:** 2026-10-06 (Asia/Bangkok). Actual UTC execution timestamps are recorded in each evidence file.  
**Result:** All executed checks passed. Phase 4 agent testing is complete.

## Environment and API URLs

- Windows PowerShell; Node.js `v24.21.0`; npm `11.19.0`; curl `8.21.0`.
- Hono `4.13.13`, Wrangler `4.147.0`, local Cloudflare D1.
- API URL for all current commands and reports: `http://127.0.0.1:8787/api`.
- The main server remains running on 8787. Both the 39-case HTTP suite and nine-case cURL suite were rerun successfully on this URL after standardizing the ports.
- Earlier temporary-server testing is historical; use port 8787 for all current commands.

## Executed checks

| Check | Actual result | Evidence |
|---|---|---|
| Clean installation, database setup, and typecheck | PASS; `npm ci`, `npm run db:setup`, and `npm run typecheck` all exited zero | Clean-copy setup procedure below; agent tool outputs and AI log |
| Main API HTTP suite | PASS; 39 cases | [TEST_EVIDENCE.md](TEST_EVIDENCE.md) |
| Professor's nine-step cURL sequence | PASS; expected statuses `200, 200, 201, 200, 200, 400, 409, 404, 204` | [cURL evidence](TEST_EVIDENCE.md#professor-guide-curl-cases), including payloads and raw HTTP headers/bodies |
| Database integrity checks | PASS; unknown equipment, reversed interval, and text timestamp rejected; zero invalid rows saved | [database evidence](TEST_EVIDENCE.md#database-constraint-cases) |
| Unexpected error / conflict mapping | PASS; three injected failure cases | [error-handler evidence](TEST_EVIDENCE.md#error-handler-cases) |
| Cleanup after cURL test | PASS; GET `/bookings` returned `200` and `[]` on the clean-copy server | Agent verification following cURL sequence |
| Restart persistence | PASS in Phase 2; not repeated in Phase 4 | Original `docs/TEST_EVIDENCE.md` in Git commit `e5fdb85` |

The Phase 4 runtime tests comprise **48 HTTP cases plus six database/error checks**. These counts exclude the clean installation, typecheck, cleanup read, and historical restart check. No failed assertions occurred.

## Database setup and test sequence

The main API uses the seeded local database under the project's `.wrangler/state`. HTTP tests use their own 2036-10-20/21 reservations and clean up the bookings they create. Database constraint tests use a separate `.wrangler/review-db-*` directory.

To verify setup independently, source, configuration, lockfile, scripts, and docs were copied to `.wrangler/phase4-verification` without dependencies or database state. The following commands succeeded there:

```powershell
npm ci
npm run db:setup
npm run typecheck
```

The migration created a new local database and seeds created two equipment records. The temporary verification server was stopped after that historical check. For current startup, use `npm run dev` from the main project root; it listens on 8787.

The updated regression tests ran from the main project root:

```powershell
npm run test:http
npm run test:errors
npm run test:db
```

The professor's cURL sequence was rerun from the main project root against the main server:

```powershell
npm run test:curl
```

The runner uses the professor's original dates, payloads, and request order. JSON files passed to `curl.exe --data-binary` avoid Windows shell quoting differences. Test-created bookings are deleted afterward. Existing application bookings were not reset. Both HTTP clients now read `scripts/config.mjs`, so a stale environment override cannot point them to another port.

## Coverage and limits

Verified: six required routes, create/read/update/delete response fields, full and partial PATCH, JSON errors, malformed inputs, timestamp validity/order, timezone conversion, equipment validation, update self-exclusion, rejected updates preserving values, all principal overlap shapes, adjacent intervals, independent equipment, SQL-like text stored as data, and concurrent conflicting creates leaving one reservation.

Remaining limits:

- Phase 4 initially tested local development. Remote deployment was subsequently completed; the deployed-API sections below contain 48 passing HTTP/cURL cases. Authentication is not implemented.
- Simultaneous partial edits to the same booking have no version check and may overwrite earlier-read values. Concurrent booking conflict prevention is tested separately and works.
- Error-handler tests inject D1 failures; they do not reproduce a real database outage.
- No instructor starter was supplied. The first-version snapshot records actual development time, not measured exam minute 30.
- Phase 5 final submission checks and student personal verification/explanations remain pending. These results do not assert that the student can independently explain the implementation.

<!-- END summary -->


<!-- BEGIN http -->
## HTTP regression cases


Executed: 2026-10-06T07:39:15.587Z (UTC).
Base URL: `http://127.0.0.1:8787/api`.
Client: Node.js fetch HTTP client.
Command: `npm run test:http`.
Overall result: PASS.
Uses 2036-10-20/21 with seeded equipment. Created test bookings are removed afterward.

The original Phase 2 evidence, including restart persistence, remains in Git commit e5fdb85.

```json
[
  {
    "name": "Seeded equipment",
    "method": "GET",
    "path": "/equipment",
    "expected": 200,
    "actual": 200,
    "response": [
      {
        "id": "eq-1",
        "name": "Projector A",
        "location": "Building 1"
      },
      {
        "id": "eq-2",
        "name": "Camera A",
        "location": "Building 2"
      }
    ]
  },
  {
    "name": "Create booking with SQL-like text",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "List bookings",
    "method": "GET",
    "path": "/bookings",
    "expected": 200,
    "actual": 200,
    "response": [
      {
        "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T09:00:00.000Z",
        "endAt": "2036-10-20T11:00:00.000Z",
        "purpose": "HTTP verification"
      }
    ]
  },
  {
    "name": "Fetch booking",
    "method": "GET",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Purpose-only patch excludes itself",
    "method": "PATCH",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "request": {
      "purpose": "Updated"
    },
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "Updated"
    }
  },
  {
    "name": "Full payload update from instructor guide",
    "method": "PATCH",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "purpose": "Updated class presentation",
      "startAt": "2036-10-20T12:00:00.000Z",
      "endAt": "2036-10-20T14:00:00.000Z"
    },
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "startAt": "2036-10-20T12:00:00.000Z",
      "endAt": "2036-10-20T14:00:00.000Z",
      "purpose": "Updated class presentation"
    }
  },
  {
    "name": "Read after full update",
    "method": "GET",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "startAt": "2036-10-20T12:00:00.000Z",
      "endAt": "2036-10-20T14:00:00.000Z",
      "purpose": "Updated class presentation"
    }
  },
  {
    "name": "Restore initial interval",
    "method": "PATCH",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Identical conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Partial conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T10:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Contained conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:30:00.000Z",
      "endAt": "2036-10-20T10:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Enclosing conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T08:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Touching end boundary",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "fa51f300-2d3a-4603-84ee-28ad9ee7d966",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Touching start boundary",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T08:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "573a26b9-f023-41f6-8bb6-9a1808ad3ec3",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T08:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Different equipment may overlap",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-2",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "d55e9067-418e-4cbd-a2aa-46945cea3685",
      "equipmentId": "eq-2",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Time update conflict",
    "method": "PATCH",
    "path": "/bookings/fa51f300-2d3a-4603-84ee-28ad9ee7d966",
    "request": {
      "startAt": "2036-10-20T10:00:00Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Failed update preserves original",
    "method": "GET",
    "path": "/bookings/fa51f300-2d3a-4603-84ee-28ad9ee7d966",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "fa51f300-2d3a-4603-84ee-28ad9ee7d966",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Equipment update conflict",
    "method": "PATCH",
    "path": "/bookings/d55e9067-418e-4cbd-a2aa-46945cea3685",
    "request": {
      "equipmentId": "eq-1"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Failed equipment update preserves all fields",
    "method": "GET",
    "path": "/bookings/d55e9067-418e-4cbd-a2aa-46945cea3685",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "d55e9067-418e-4cbd-a2aa-46945cea3685",
      "equipmentId": "eq-2",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Missing fields",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "borrowerName must be a non-empty string"
    }
  },
  {
    "name": "Wrong field type",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": 5,
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "borrowerName must be a non-empty string"
    }
  },
  {
    "name": "Unknown equipment",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "missing",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "equipmentId must reference existing equipment"
    }
  },
  {
    "name": "Impossible date",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-02-30T09:00:00Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must contain a valid calendar date and time"
    }
  },
  {
    "name": "Timezone missing",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must be an ISO timestamp with an explicit timezone"
    }
  },
  {
    "name": "Equal times",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must be before endAt"
    }
  },
  {
    "name": "Reversed times",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must be before endAt"
    }
  },
  {
    "name": "Unknown field",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "extra": true
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body contains unknown fields"
    }
  },
  {
    "name": "Malformed JSON",
    "method": "POST",
    "path": "/bookings",
    "request": "{",
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body must be valid JSON"
    }
  },
  {
    "name": "Null body",
    "method": "POST",
    "path": "/bookings",
    "request": "null",
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body must be a JSON object"
    }
  },
  {
    "name": "Empty patch",
    "method": "PATCH",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "request": {},
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body must contain booking fields"
    }
  },
  {
    "name": "GET missing booking",
    "method": "GET",
    "path": "/bookings/missing",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  },
  {
    "name": "PATCH missing booking",
    "method": "PATCH",
    "path": "/bookings/missing",
    "request": {
      "purpose": "x"
    },
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  },
  {
    "name": "DELETE missing booking",
    "method": "DELETE",
    "path": "/bookings/missing",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  },
  {
    "name": "Unknown route",
    "method": "GET",
    "path": "/unknown",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Resource not found"
    }
  },
  {
    "name": "Timezone normalization",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-21T09:00:00+07:00",
      "endAt": "2036-10-21T10:00:00+07:00"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "138ef5af-a27a-458a-b50b-b79507c82e9d",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-21T02:00:00.000Z",
      "endAt": "2036-10-21T03:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Concurrent conflicting creates",
    "expected": [
      201,
      409
    ],
    "actual": [
      201,
      409
    ],
    "response": [
      {
        "status": 201,
        "body": {
          "id": "1dd21870-5acc-458e-8d7d-f5d7b1dc6fcf",
          "equipmentId": "eq-1",
          "borrowerName": "O'Brien; DROP TABLE bookings; --",
          "startAt": "2036-10-20T14:00:00.000Z",
          "endAt": "2036-10-20T15:00:00.000Z",
          "purpose": "HTTP verification"
        }
      },
      {
        "status": 409,
        "body": {
          "error": "Equipment is already booked during this time"
        }
      }
    ]
  },
  {
    "name": "Concurrent creates leave exactly one reservation",
    "method": "GET",
    "path": "/bookings",
    "expected": 200,
    "actual": 200,
    "response": [
      {
        "id": "573a26b9-f023-41f6-8bb6-9a1808ad3ec3",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T08:00:00.000Z",
        "endAt": "2036-10-20T09:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T09:00:00.000Z",
        "endAt": "2036-10-20T11:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "d55e9067-418e-4cbd-a2aa-46945cea3685",
        "equipmentId": "eq-2",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T09:00:00.000Z",
        "endAt": "2036-10-20T11:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "fa51f300-2d3a-4603-84ee-28ad9ee7d966",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T11:00:00.000Z",
        "endAt": "2036-10-20T12:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "1dd21870-5acc-458e-8d7d-f5d7b1dc6fcf",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T14:00:00.000Z",
        "endAt": "2036-10-20T15:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "138ef5af-a27a-458a-b50b-b79507c82e9d",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-21T02:00:00.000Z",
        "endAt": "2036-10-21T03:00:00.000Z",
        "purpose": "HTTP verification"
      }
    ]
  },
  {
    "name": "Delete booking",
    "method": "DELETE",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "expected": 204,
    "actual": 204,
    "response": null
  },
  {
    "name": "Fetch deleted booking",
    "method": "GET",
    "path": "/bookings/c79707ba-cf41-4a29-bf6d-c6b93f3ee3dc",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  }
]
```

<!-- END http -->


<!-- BEGIN curl -->
## Professor guide cURL cases


Executed: 2026-10-06T07:39:16.222Z UTC.
Base URL: http://127.0.0.1:8787/api.
Command: npm run test:curl (shared local URL in scripts/config.mjs).
Overall result: PASS.
Uses the professor guide payloads and order. Windows curl.exe receives JSON via files to avoid shell quoting differences. Expected codes and raw HTTP headers/bodies are recorded below. Run against a clean database or leave eq-1 on 2026-10-20 free; test booking is cleaned up afterward.

## 1. List equipment

GET http://127.0.0.1:8787/api/equipment
Expected: 200; actual: 200.

Raw response:

```http
HTTP/1.1 200 OK
Content-Length: 116
Content-Type: application/json

[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera A","location":"Building 2"}]
```

## 2. List bookings

GET http://127.0.0.1:8787/api/bookings
Expected: 200; actual: 200.

Raw response:

```http
HTTP/1.1 200 OK
Content-Length: 2
Content-Type: application/json

[]
```

## 3. Create booking

POST http://127.0.0.1:8787/api/bookings
Expected: 201; actual: 201.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Raw response:

```http
HTTP/1.1 201 Created
Content-Length: 201
Content-Type: application/json

{"id":"f4fa7ac8-0663-43a0-9aa8-5474cf23869a","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## 4. Get one booking

GET http://127.0.0.1:8787/api/bookings/f4fa7ac8-0663-43a0-9aa8-5474cf23869a
Expected: 200; actual: 200.

Raw response:

```http
HTTP/1.1 200 OK
Content-Length: 201
Content-Type: application/json

{"id":"f4fa7ac8-0663-43a0-9aa8-5474cf23869a","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## 5. Full update

PATCH http://127.0.0.1:8787/api/bookings/f4fa7ac8-0663-43a0-9aa8-5474cf23869a
Expected: 200; actual: 200.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T12:00:00.000Z",
  "endAt": "2026-10-20T14:00:00.000Z",
  "purpose": "Updated class presentation"
}
```

Raw response:

```http
HTTP/1.1 200 OK
Content-Length: 209
Content-Type: application/json

{"id":"f4fa7ac8-0663-43a0-9aa8-5474cf23869a","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T12:00:00.000Z","endAt":"2026-10-20T14:00:00.000Z","purpose":"Updated class presentation"}
```

## 6. Invalid time range

POST http://127.0.0.1:8787/api/bookings
Expected: 400; actual: 400.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-21T11:00:00.000Z",
  "endAt": "2026-10-21T09:00:00.000Z",
  "purpose": "Invalid time range test"
}
```

Raw response:

```http
HTTP/1.1 400 Bad Request
Content-Length: 40
Content-Type: application/json

{"error":"startAt must be before endAt"}
```

## 7. Overlap after update

POST http://127.0.0.1:8787/api/bookings
Expected: 409; actual: 409.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Suda Dee",
  "startAt": "2026-10-20T12:30:00.000Z",
  "endAt": "2026-10-20T13:30:00.000Z",
  "purpose": "Conflict test"
}
```

Raw response:

```http
HTTP/1.1 409 Conflict
Content-Length: 56
Content-Type: application/json

{"error":"Equipment is already booked during this time"}
```

## 8. Missing booking

GET http://127.0.0.1:8787/api/bookings/not-found
Expected: 404; actual: 404.

Raw response:

```http
HTTP/1.1 404 Not Found
Content-Length: 29
Content-Type: application/json

{"error":"Booking not found"}
```

## 9. Delete booking

DELETE http://127.0.0.1:8787/api/bookings/f4fa7ac8-0663-43a0-9aa8-5474cf23869a
Expected: 204; actual: 204.

Raw response:

```http
HTTP/1.1 204 No Content


```

<!-- END curl -->


<!-- BEGIN database -->
## Database constraint cases


Executed: 2026-10-06T07:39:24.311Z UTC.
Command: npm run test:db.
Isolated local D1 directory: .wrangler/review-db-1791272356945.
Application database was not modified. All three invalid inserts were rejected; final booking count was zero.

```json
[
  {
    "name": "Foreign key rejects unknown equipment",
    "sql": "INSERT INTO bookings VALUES ('review-id', 'missing', 'Review', 1000, 2000, 'Constraint check')",
    "expectedError": "FOREIGN KEY",
    "actualOutput": "\n ⛅️ wrangler 4.147.0\n────────────────────\nResource location: local \n\nUse --remote if you want to access the remote instance.\n\n🌀 Executing on local database campus-booking (00000000-0000-0000-0000-000000000001) from .wrangler\\review-db-1791272356945\\v3\\d1:\n🌀 To execute on your remote database, add a --remote flag to your wrangler command.\n\n\u001b[31mX \u001b[41;31m[\u001b[41;97mERROR\u001b[41;31m]\u001b[0m \u001b[1mFOREIGN KEY constraint failed: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_FOREIGNKEY)\u001b[0m\n\n\n🪵  Logs were written to \"C:\\Users\\nadiz\\AppData\\Roaming\\xdg.config\\.wrangler\\logs\\wrangler-2026-10-06_07-39-20_434.log\"\n",
    "result": "PASS"
  },
  {
    "name": "Chronology constraint rejects reversed interval",
    "sql": "INSERT INTO bookings VALUES ('review-id', 'eq-1', 'Review', 2000, 1000, 'Constraint check')",
    "expectedError": "CHECK constraint",
    "actualOutput": "\n ⛅️ wrangler 4.147.0\n────────────────────\nResource location: local \n\nUse --remote if you want to access the remote instance.\n\n🌀 Executing on local database campus-booking (00000000-0000-0000-0000-000000000001) from .wrangler\\review-db-1791272356945\\v3\\d1:\n🌀 To execute on your remote database, add a --remote flag to your wrangler command.\n\n\u001b[31mX \u001b[41;31m[\u001b[41;97mERROR\u001b[41;31m]\u001b[0m \u001b[1mCHECK constraint failed: typeof(endAt) = 'integer' AND endAt > startAt: SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_CHECK)\u001b[0m\n\n\n🪵  Logs were written to \"C:\\Users\\nadiz\\AppData\\Roaming\\xdg.config\\.wrangler\\logs\\wrangler-2026-10-06_07-39-21_536.log\"\n",
    "result": "PASS"
  },
  {
    "name": "Integer constraint rejects text timestamp",
    "sql": "INSERT INTO bookings VALUES ('review-id', 'eq-1', 'Review', 'not-a-time', 2000, 'Constraint check')",
    "expectedError": "CHECK constraint",
    "actualOutput": "\n ⛅️ wrangler 4.147.0\n────────────────────\nResource location: local \n\nUse --remote if you want to access the remote instance.\n\n🌀 Executing on local database campus-booking (00000000-0000-0000-0000-000000000001) from .wrangler\\review-db-1791272356945\\v3\\d1:\n🌀 To execute on your remote database, add a --remote flag to your wrangler command.\n\n\u001b[31mX \u001b[41;31m[\u001b[41;97mERROR\u001b[41;31m]\u001b[0m \u001b[1mCHECK constraint failed: typeof(startAt) = 'integer': SQLITE_CONSTRAINT (extended: SQLITE_CONSTRAINT_CHECK)\u001b[0m\n\n\n🪵  Logs were written to \"C:\\Users\\nadiz\\AppData\\Roaming\\xdg.config\\.wrangler\\logs\\wrangler-2026-10-06_07-39-22_708.log\"\n",
    "result": "PASS"
  }
]
```

<!-- END database -->


<!-- BEGIN errors -->
## Error handler cases


Executed: 2026-10-06T07:39:16.628Z UTC.
Command: npm run test:errors.
Method: invoke the real Hono application with an injected failing D1 binding; no production test route or database mutation. Expected failures are logged to the terminal by the server error handler. This verifies error mapping, not live database availability.

```json
[
  {
    "name": "Unexpected database failure is sanitized",
    "status": 500,
    "body": {
      "error": "Internal server error"
    },
    "result": "PASS"
  },
  {
    "name": "Trigger marker in nested cause becomes conflict",
    "status": 409,
    "body": {
      "error": "Equipment is already booked during this time"
    },
    "result": "PASS"
  },
  {
    "name": "Unrelated constraint failure is not a booking conflict",
    "status": 500,
    "body": {
      "error": "Internal server error"
    },
    "result": "PASS"
  }
]
```

<!-- END errors -->


<!-- BEGIN remote-http -->
## Deployed API HTTP cases


Executed: 2026-10-06T07:45:20.765Z (UTC).
Base URL: `https://campus-equipment-booking-api.svg-asset.workers.dev/api`.
Client: Node.js fetch HTTP client.
Command: `npm run test:http`.
Overall result: PASS.
Uses 2036-10-20/21 with seeded equipment. Created test bookings are removed afterward.

The original Phase 2 evidence, including restart persistence, remains in Git commit e5fdb85.

```json
[
  {
    "name": "Seeded equipment",
    "method": "GET",
    "path": "/equipment",
    "expected": 200,
    "actual": 200,
    "response": [
      {
        "id": "eq-1",
        "name": "Projector A",
        "location": "Building 1"
      },
      {
        "id": "eq-2",
        "name": "Camera A",
        "location": "Building 2"
      }
    ]
  },
  {
    "name": "Create booking with SQL-like text",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "List bookings",
    "method": "GET",
    "path": "/bookings",
    "expected": 200,
    "actual": 200,
    "response": [
      {
        "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T09:00:00.000Z",
        "endAt": "2036-10-20T11:00:00.000Z",
        "purpose": "HTTP verification"
      }
    ]
  },
  {
    "name": "Fetch booking",
    "method": "GET",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Purpose-only patch excludes itself",
    "method": "PATCH",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "request": {
      "purpose": "Updated"
    },
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "Updated"
    }
  },
  {
    "name": "Full payload update from instructor guide",
    "method": "PATCH",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "purpose": "Updated class presentation",
      "startAt": "2036-10-20T12:00:00.000Z",
      "endAt": "2036-10-20T14:00:00.000Z"
    },
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "startAt": "2036-10-20T12:00:00.000Z",
      "endAt": "2036-10-20T14:00:00.000Z",
      "purpose": "Updated class presentation"
    }
  },
  {
    "name": "Read after full update",
    "method": "GET",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
      "equipmentId": "eq-1",
      "borrowerName": "Somchai Jaidee",
      "startAt": "2036-10-20T12:00:00.000Z",
      "endAt": "2036-10-20T14:00:00.000Z",
      "purpose": "Updated class presentation"
    }
  },
  {
    "name": "Restore initial interval",
    "method": "PATCH",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Identical conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Partial conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T10:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Contained conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:30:00.000Z",
      "endAt": "2036-10-20T10:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Enclosing conflict",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T08:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Touching end boundary",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "b097c299-f544-4e2c-a361-8147e4bf0a06",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Touching start boundary",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T08:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "c0c12f60-9430-4e5e-bcb4-10bc8b498447",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T08:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Different equipment may overlap",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-2",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "a8837625-c630-43ae-a8cc-e0169e2aa149",
      "equipmentId": "eq-2",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Time update conflict",
    "method": "PATCH",
    "path": "/bookings/b097c299-f544-4e2c-a361-8147e4bf0a06",
    "request": {
      "startAt": "2036-10-20T10:00:00Z"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Failed update preserves original",
    "method": "GET",
    "path": "/bookings/b097c299-f544-4e2c-a361-8147e4bf0a06",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "b097c299-f544-4e2c-a361-8147e4bf0a06",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T12:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Equipment update conflict",
    "method": "PATCH",
    "path": "/bookings/a8837625-c630-43ae-a8cc-e0169e2aa149",
    "request": {
      "equipmentId": "eq-1"
    },
    "expected": 409,
    "actual": 409,
    "response": {
      "error": "Equipment is already booked during this time"
    }
  },
  {
    "name": "Failed equipment update preserves all fields",
    "method": "GET",
    "path": "/bookings/a8837625-c630-43ae-a8cc-e0169e2aa149",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "a8837625-c630-43ae-a8cc-e0169e2aa149",
      "equipmentId": "eq-2",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Missing fields",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "borrowerName must be a non-empty string"
    }
  },
  {
    "name": "Wrong field type",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": 5,
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "borrowerName must be a non-empty string"
    }
  },
  {
    "name": "Unknown equipment",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "missing",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "equipmentId must reference existing equipment"
    }
  },
  {
    "name": "Impossible date",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-02-30T09:00:00Z",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must contain a valid calendar date and time"
    }
  },
  {
    "name": "Timezone missing",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00",
      "endAt": "2036-10-20T11:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must be an ISO timestamp with an explicit timezone"
    }
  },
  {
    "name": "Equal times",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must be before endAt"
    }
  },
  {
    "name": "Reversed times",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T11:00:00.000Z",
      "endAt": "2036-10-20T09:00:00.000Z"
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "startAt must be before endAt"
    }
  },
  {
    "name": "Unknown field",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "extra": true
    },
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body contains unknown fields"
    }
  },
  {
    "name": "Malformed JSON",
    "method": "POST",
    "path": "/bookings",
    "request": "{",
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body must be valid JSON"
    }
  },
  {
    "name": "Null body",
    "method": "POST",
    "path": "/bookings",
    "request": "null",
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body must be a JSON object"
    }
  },
  {
    "name": "Empty patch",
    "method": "PATCH",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "request": {},
    "expected": 400,
    "actual": 400,
    "response": {
      "error": "Request body must contain booking fields"
    }
  },
  {
    "name": "GET missing booking",
    "method": "GET",
    "path": "/bookings/missing",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  },
  {
    "name": "PATCH missing booking",
    "method": "PATCH",
    "path": "/bookings/missing",
    "request": {
      "purpose": "x"
    },
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  },
  {
    "name": "DELETE missing booking",
    "method": "DELETE",
    "path": "/bookings/missing",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  },
  {
    "name": "Unknown route",
    "method": "GET",
    "path": "/unknown",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Resource not found"
    }
  },
  {
    "name": "Timezone normalization",
    "method": "POST",
    "path": "/bookings",
    "request": {
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "purpose": "HTTP verification",
      "startAt": "2036-10-21T09:00:00+07:00",
      "endAt": "2036-10-21T10:00:00+07:00"
    },
    "expected": 201,
    "actual": 201,
    "response": {
      "id": "70ac7930-5dd1-434e-a2f0-15be16bb40ad",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-21T02:00:00.000Z",
      "endAt": "2036-10-21T03:00:00.000Z",
      "purpose": "HTTP verification"
    }
  },
  {
    "name": "Concurrent conflicting creates",
    "expected": [
      201,
      409
    ],
    "actual": [
      201,
      409
    ],
    "response": [
      {
        "status": 201,
        "body": {
          "id": "49ac8569-d79f-45dc-b4b6-badfff6fdd4d",
          "equipmentId": "eq-1",
          "borrowerName": "O'Brien; DROP TABLE bookings; --",
          "startAt": "2036-10-20T14:00:00.000Z",
          "endAt": "2036-10-20T15:00:00.000Z",
          "purpose": "HTTP verification"
        }
      },
      {
        "status": 409,
        "body": {
          "error": "Equipment is already booked during this time"
        }
      }
    ]
  },
  {
    "name": "Concurrent creates leave exactly one reservation",
    "method": "GET",
    "path": "/bookings",
    "expected": 200,
    "actual": 200,
    "response": [
      {
        "id": "c0c12f60-9430-4e5e-bcb4-10bc8b498447",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T08:00:00.000Z",
        "endAt": "2036-10-20T09:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "15f9160a-5c4c-43f4-9cd7-870b299a41d3",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T09:00:00.000Z",
        "endAt": "2036-10-20T11:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "a8837625-c630-43ae-a8cc-e0169e2aa149",
        "equipmentId": "eq-2",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T09:00:00.000Z",
        "endAt": "2036-10-20T11:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "b097c299-f544-4e2c-a361-8147e4bf0a06",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T11:00:00.000Z",
        "endAt": "2036-10-20T12:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "49ac8569-d79f-45dc-b4b6-badfff6fdd4d",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-20T14:00:00.000Z",
        "endAt": "2036-10-20T15:00:00.000Z",
        "purpose": "HTTP verification"
      },
      {
        "id": "70ac7930-5dd1-434e-a2f0-15be16bb40ad",
        "equipmentId": "eq-1",
        "borrowerName": "O'Brien; DROP TABLE bookings; --",
        "startAt": "2036-10-21T02:00:00.000Z",
        "endAt": "2036-10-21T03:00:00.000Z",
        "purpose": "HTTP verification"
      }
    ]
  },
  {
    "name": "Delete booking",
    "method": "DELETE",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "expected": 204,
    "actual": 204,
    "response": null
  },
  {
    "name": "Fetch deleted booking",
    "method": "GET",
    "path": "/bookings/15f9160a-5c4c-43f4-9cd7-870b299a41d3",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  }
]
```

<!-- END remote-http -->


<!-- BEGIN remote-curl -->
## Deployed API cURL cases


Executed: 2026-10-06T07:45:26.162Z UTC.
Base URL: https://campus-equipment-booking-api.svg-asset.workers.dev/api.
Command: npm run test:curl (shared local URL in scripts/config.mjs).
Overall result: PASS.
Uses the professor guide payloads and order. Windows curl.exe receives JSON via files to avoid shell quoting differences. Expected codes and raw HTTP headers/bodies are recorded below. Run against a clean database or leave eq-1 on 2026-10-20 free; test booking is cleaned up afterward.

## 1. List equipment

GET https://campus-equipment-booking-api.svg-asset.workers.dev/api/equipment
Expected: 200; actual: 200.

Raw response:

```http
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:45:21 GMT
Content-Type: application/json
Content-Length: 116
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=HbEaYk4AFXJqEygUwm9wkzVd%2Bhcefqdor8gcSVxCJBw3wR2zFHT6fGdLZHtF5ye%2BlbYN0Mc507Mz4rVsZsAha29OzT27JBPkcDgZ6e6vkzldO4vSCWLw5BOEmy7OD0Ts9E3zIl3PqiqCs7iEHjA1vTsFl%2BtXAoPtkDCVz47BNc2X0nGVfg%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630bcf5c7a097a-HKG
alt-svc: h3=":443"; ma=86400

[{"id":"eq-1","name":"Projector A","location":"Building 1"},{"id":"eq-2","name":"Camera A","location":"Building 2"}]
```

## 2. List bookings

GET https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings
Expected: 200; actual: 200.

Raw response:

```http
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:45:22 GMT
Content-Type: application/json
Content-Length: 2
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=z9x1nw%2B%2B3xPBzwtNwiMEQxOXqDfnfuncG7x4%2FZWX5G04QeckczIHjcgQMEeqQ7%2BVnE0%2FCvmfvSsD4PvbuVOvqknCu%2FDWrDqDE37ZwNKnHfTQI1lm8qWvC%2F1Q0PXZjfnRd5nR8gEDAwMFWkzUxtlyK95y9XYYbBcwK3%2BJXvul7McJSM8jrw%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630bd1e80b1fc8-HKG
alt-svc: h3=":443"; ma=86400

[]
```

## 3. Create booking

POST https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings
Expected: 201; actual: 201.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

Raw response:

```http
HTTP/1.1 201 Created
Date: Tue, 06 Oct 2026 07:45:23 GMT
Content-Type: application/json
Content-Length: 201
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=323oK%2BngXWtjs0OnC%2Fe9F%2BsiQWl0b6%2BXPxIKku4WS4p6fKR4N6r636QnBhLc1t6Ne8M9IGpzwXczF1bGaPCofoWhZJLWqQGfNoUnsblNPeJRaIzCc9Y3jt5tmkIrvdZ5Z12wLIEe7%2Fs9yUprimO%2Fgn32RyTssGvdD1vehT7PFz%2BsiyQVXg%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630bd67a4cf8ea-SIN
alt-svc: h3=":443"; ma=86400

{"id":"58c1d5f5-8016-4b64-ae46-9cf35d15ccac","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## 4. Get one booking

GET https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings/58c1d5f5-8016-4b64-ae46-9cf35d15ccac
Expected: 200; actual: 200.

Raw response:

```http
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:45:23 GMT
Content-Type: application/json
Content-Length: 201
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=VH0M75t84n%2FhPue4u73pl77glKL4cHxvT8FBc71NNCjuPKJhzieMeULEREs8bTx6ZfCvKP0athFEUXXfKtAxDwNshVSaQEoZrv1nob2kGFjyPqf%2F3Li9DL1Pyq0EWy4CiegqP0VzT3Kf62PtRWY04rY5STwCFsHo7Rz7H%2F3ztpW186rO%2Bw%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630bd90dc185ce-HKG
alt-svc: h3=":443"; ma=86400

{"id":"58c1d5f5-8016-4b64-ae46-9cf35d15ccac","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}
```

## 5. Full update

PATCH https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings/58c1d5f5-8016-4b64-ae46-9cf35d15ccac
Expected: 200; actual: 200.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T12:00:00.000Z",
  "endAt": "2026-10-20T14:00:00.000Z",
  "purpose": "Updated class presentation"
}
```

Raw response:

```http
HTTP/1.1 200 OK
Date: Tue, 06 Oct 2026 07:45:24 GMT
Content-Type: application/json
Content-Length: 209
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=VghXOvNaOgAnJolVQsWcbOz1jiPC%2B%2BQlCFF0J%2FmG5mj1ncOiVnksFF44ndCEcCZY6ZKbvDd6OkRv7sIkxAfsyO3U%2BW6ncNRGlUEA5IvVpR4N2k4lE1Dv0IGlxIiBgK4dDloVRpSUuktejhDySa7OxXdA%2B6pTh2pTaTMfKQENnuMgtA%2B%2BHw%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630bdcdcd46584-SIN
alt-svc: h3=":443"; ma=86400

{"id":"58c1d5f5-8016-4b64-ae46-9cf35d15ccac","equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T12:00:00.000Z","endAt":"2026-10-20T14:00:00.000Z","purpose":"Updated class presentation"}
```

## 6. Invalid time range

POST https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings
Expected: 400; actual: 400.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-21T11:00:00.000Z",
  "endAt": "2026-10-21T09:00:00.000Z",
  "purpose": "Invalid time range test"
}
```

Raw response:

```http
HTTP/1.1 400 Bad Request
Date: Tue, 06 Oct 2026 07:45:24 GMT
Content-Type: application/json
Content-Length: 40
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=HGKhxm4SDa7UQRFoU5dxQdzAxFCVNH3K2LDwJk%2B2cY2h1LyAYMtFRy%2BBTuZ58OHIteKJbfKb%2FYCuP8HlzMp1PRqUAoxvdeBhCd5m8U9b%2FYT9SiLnS76omF8zJo7oKYyhR7xIAIDULFZftnvah2laWrdiDqLzqnMip2S5%2FeGJKwasXukfow%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630be16a0ff548-HKG
alt-svc: h3=":443"; ma=86400

{"error":"startAt must be before endAt"}
```

## 7. Overlap after update

POST https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings
Expected: 409; actual: 409.

Request payload:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Suda Dee",
  "startAt": "2026-10-20T12:30:00.000Z",
  "endAt": "2026-10-20T13:30:00.000Z",
  "purpose": "Conflict test"
}
```

Raw response:

```http
HTTP/1.1 409 Conflict
Date: Tue, 06 Oct 2026 07:45:25 GMT
Content-Type: application/json
Content-Length: 56
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=uUyRkQH3mLNFi4nPgSwNbx1tw3wAXC05hdCw3q%2F%2Ffh%2F2JDeOT%2Fr7QUw0UVZhWxUX%2FvAcugUMg4eRocZ2ftayEvjj2t7H57%2FYkbNRlFzTiQxYVzoQNTF50dZiZuGerdPn9RY50NeqYjNsCN9ugdHsJT0%2FcjC3ylMMMmuoS9ShcD7Qlx2xrA%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630be699554e24-SIN
alt-svc: h3=":443"; ma=86400

{"error":"Equipment is already booked during this time"}
```

## 8. Missing booking

GET https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings/not-found
Expected: 404; actual: 404.

Raw response:

```http
HTTP/1.1 404 Not Found
Date: Tue, 06 Oct 2026 07:45:25 GMT
Content-Type: application/json
Content-Length: 29
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=t%2BK3dS%2BTBGQS9RLqqmDQOdYNWC2nIKGeBIS2HCfihzISdY9lakaytSMbo14etm7aJ5hf3EyHtOPLGFYrleYa7eQOorvtobTciX5E9Eeiin9biEsD6iZzcEEt37gtOZmYCv%2BhaaSh95HtuUKWVoTB3O5JORl%2BA9bj1UPrroTHl4COc2PAbg%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630be82f15ce3e-SIN
alt-svc: h3=":443"; ma=86400

{"error":"Booking not found"}
```

## 9. Delete booking

DELETE https://campus-equipment-booking-api.svg-asset.workers.dev/api/bookings/58c1d5f5-8016-4b64-ae46-9cf35d15ccac
Expected: 204; actual: 204.

Raw response:

```http
HTTP/1.1 204 No Content
Date: Tue, 06 Oct 2026 07:45:26 GMT
Connection: keep-alive
Report-To: {"group":"cf-nel","max_age":604800,"endpoints":[{"url":"https://a.nel.cloudflare.com/report/v4?s=%2FXJ8wIkz8sjvS%2B8WiE7xWu9e9hkhGggAVCxdL3i4ViTW6W8PIXLGnRWONoI9v6%2Fdm217aFKo2v6fv%2BXnH5Jmw30mAqFJRlwXn69cQgrPM84MEXH9p0jCS4PCLOXcf%2BGniysneNP0co%2Fh6uw6ZjGoj97tW6A%2FI1kaGOzoXbSannwWZTXvmw%3D%3D"}]}
Nel: {"report_to":"cf-nel","success_fraction":0.0,"max_age":604800}
Server: cloudflare
CF-RAY: a4630be978ecfd98-SIN
alt-svc: h3=":443"; ma=86400


```

<!-- END remote-curl -->
