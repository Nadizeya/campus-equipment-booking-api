# Phase 2 First-Version Snapshot

The local commit named **Phase 2: implement local equipment booking API** captures the first version before Phase 3 improvements. Locate its ID and actual timestamp with:

```powershell
git log --format="%h %aI %s" --all
```

The commit uses the existing Git author configuration. This session was not performed against an exam clock; no claim of capture at minute 30 is made.

Scope: source, migrations, seeds, package/runtime configuration, scripts, exam documents, design, AI log, run instructions, and actual HTTP evidence. Dependencies and local database files are excluded; recreate them with `npm ci` and `npm run db:setup`.

Before capture, TypeScript checks, local migration/seeding, and 34 HTTP cases passed. A separate restart check verified persistence. Test bookings were removed afterward.

An additional source copy is created by `npm run snapshot` under `snapshots/`; its `SNAPSHOT.txt` records the capture time. Phase 3 Quality Gate review remains outstanding.
