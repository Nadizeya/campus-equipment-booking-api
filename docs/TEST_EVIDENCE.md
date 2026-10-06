# Phase 2 HTTP Test Evidence

Executed: 2026-10-06T06:54:51.098Z (UTC).
Base URL: `http://127.0.0.1:8787/api`.
Client: Node.js fetch HTTP client.
Command: `npm run test:http` with the local server running and seeded equipment.
Uses 2036-10-20/21; do not reserve these times while running this test. Created test bookings are removed afterward.

Evidence below records actual request/response results. The runner exits nonzero on failed assertions.

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
      "id": "2f5fdb99-5a3f-4785-8965-328e173a1580",
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
        "id": "2f5fdb99-5a3f-4785-8965-328e173a1580",
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
    "path": "/bookings/2f5fdb99-5a3f-4785-8965-328e173a1580",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "2f5fdb99-5a3f-4785-8965-328e173a1580",
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
    "path": "/bookings/2f5fdb99-5a3f-4785-8965-328e173a1580",
    "request": {
      "purpose": "Updated"
    },
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "2f5fdb99-5a3f-4785-8965-328e173a1580",
      "equipmentId": "eq-1",
      "borrowerName": "O'Brien; DROP TABLE bookings; --",
      "startAt": "2036-10-20T09:00:00.000Z",
      "endAt": "2036-10-20T11:00:00.000Z",
      "purpose": "Updated"
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
      "id": "8764ca89-7680-4024-a4c5-eebcb69931e7",
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
      "id": "1ba29d5d-ad30-41ad-80a1-5225371a4f02",
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
      "id": "dc996b55-5f97-4e04-8bd6-e54d4bfdf562",
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
    "path": "/bookings/8764ca89-7680-4024-a4c5-eebcb69931e7",
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
    "path": "/bookings/8764ca89-7680-4024-a4c5-eebcb69931e7",
    "expected": 200,
    "actual": 200,
    "response": {
      "id": "8764ca89-7680-4024-a4c5-eebcb69931e7",
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
    "path": "/bookings/dc996b55-5f97-4e04-8bd6-e54d4bfdf562",
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
    "path": "/bookings/2f5fdb99-5a3f-4785-8965-328e173a1580",
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
      "id": "a5ebfa48-5246-40bd-a0f3-409461a8958b",
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
          "id": "121b7ee7-144a-46ff-a5af-5115dd7f4fe6",
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
    "name": "Delete booking",
    "method": "DELETE",
    "path": "/bookings/2f5fdb99-5a3f-4785-8965-328e173a1580",
    "expected": 204,
    "actual": 204,
    "response": null
  },
  {
    "name": "Fetch deleted booking",
    "method": "GET",
    "path": "/bookings/2f5fdb99-5a3f-4785-8965-328e173a1580",
    "expected": 404,
    "actual": 404,
    "response": {
      "error": "Booking not found"
    }
  }
]
```

## Restart persistence check

Created booking 5b796750-f954-4a77-b2bc-38a312cf1eb3, stopped Wrangler, restarted with npm run dev, then fetched the same ID: HTTP 200.

Response: {"id":"5b796750-f954-4a77-b2bc-38a312cf1eb3","equipmentId":"eq-1","borrowerName":"Persistence check","startAt":"2037-01-01T09:00:00.000Z","endAt":"2037-01-01T10:00:00.000Z","purpose":"Restart verification"}

Deleted the verification booking afterward.

