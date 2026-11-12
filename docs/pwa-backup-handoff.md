# PWA backup handoff

The backup format remains version 1 and the image library schema is unchanged.
The home-page reminder is **local-test-only and off by default**. It never
appears on the production hostname, even if a test flag is present. On a local
hostname or private LAN IP, open `/artbot?backup_lab=1` to opt in; this setting
persists for later launches. Use `?backup_lab=0` to disable it. Settings backup
progress remains available normally.

This follow-up makes it easier to finish saving a prepared backup when iPhone
Files recreates the app document. It does not establish physical iPhone acceptance.

## User workflow

1. Prepare a backup in Settings → Import / Export.
2. Save its manifest and every part outside browser storage. Save/share requests
   are recorded separately from verification; tapping Save never verifies a file.
3. Under **Verify saved backup**, select a few saved files or the whole set.
   Each successful batch records which files match this preparation's exact names,
   sizes and checksums. Failed or cancelled batches do not advance verification.
4. In the opted-in local test app, if ArtBot returns to its home page, choose **Continue backup**. The link selects
   the exact preparation. Verified-file counts survive a full browser restart.
5. When every saved file has been checked, the engine audits record graphs,
   fingerprints, table counts and preferences before recording completion.
   Restore still independently validates the selected files before activation.

The last verification means those copies were checked at that time; ArtBot cannot
observe later deletion or modification in Files. Keep every part and its manifest.
For a different external backup with no matching local preparation, the existing
full-set verifier remains available. Restoring still requires the full saved set.

## Durability and memory

Per-file progress lives in the existing preparation's catalog row; no catalog
schema migration is needed. A small localStorage hint enables the home-page
reminder without eagerly importing the backup engine. If localStorage is full,
prepared data and verification progress remain in IndexedDB and are accessible
from Settings; the reminder/timestamp may be unavailable. Save-request recording
is best effort during OS handoff and never substitutes for saved-file checks.

Final batch verification reads local prepared parts on demand, because the saved
copies' hashes prove they match those prepared bytes. It still performs the full
semantic audit before declaring success. The Settings download list currently
retains File objects for the prepared set; peak native memory across the full
save/share path still needs physical-device profiling. This change does not
promise a particular memory ceiling or eliminate the many-file handoff.

## Regression coverage

- Manager tests cover reopen between batches, corruption, atomic rejection,
  cancellation, localStorage quota, concurrent verifiers, native Blob/mask fidelity
  and v1 compatibility.
- `e2e/fixtures/backup-v1.json` is a frozen, synthetic format-v1 artifact containing
  binary sources, a mask, a favorite, a Date, undefined and unknown fields. Keep
  it unchanged when updating the writer; add new fixtures for future formats.
- `e2e/backupHandoff.spec.ts` downloads actual files, verifies separate batches,
  closes/reopens the browser at a narrow viewport, follows the home-page reminder, then restores and
  rolls back while checking source/mask bytes and favorites.
- CI runs the focused handoff, multipart, startup recovery and database roundtrip
  suites in Chromium, Firefox and WebKit, in addition to the existing full
  Chromium suite. Browser installation is pinned by the package lockfile.

## Still required on physical iPhone

Use a disposable installed app on a separate HTTPS origin, with a copied library.
Do not use the original phone installation as the test target.

- Run the complete Files save → cold reopen → batched verification → restore →
  rollback flow with a realistically large library.
- Cancel the share sheet/file picker; lock, background and terminate the app
  during each operation; check recovery after reopening.
- Exercise insufficient storage, denied persistence, missing/damaged files and
  interrupted code updates while retaining the installed icon and test origin.
- Profile native memory, preparation disk usage and the number of save/share
  interactions before choosing larger default parts or another destination.

Desktop WebKit is useful coverage but does not automate iOS Files or the installed
app lifecycle. The existing physical-device matrix in
[backup-design.md](backup-design.md#physical-iphone-checks) remains the release gate.

## Local verification

The isolated production artifact built with Node 26.13.1, Next 16.4.6 and
Playwright 1.60.0. TypeScript, changed-file ESLint and all **546 Jest tests** pass.
**48 focused browser checks** passed across Chromium, Firefox and WebKit. The matrix covers the new cold-reopen flow plus existing
multipart, preferences, interruption, restore/rollback, device-probe and manifest
checks in three engines. Private reports and screenshots are under
`__local_db/pwa-backup-handoff/` and the ignored upgrade-comparison artifacts.
No original phone library or sealed baseline is modified by these tests.

Linux WebKit CI exposed an existing fixture race: a synthetic requested job had
no claim timestamp and was legitimately marked stale before export. Its saved
archive already contained that error state. The test now freezes a valid claim
time during export, then advances the clock three minutes before restore. This
keeps the source fixture stable while testing stale restored-job quarantine
explicitly; production cleanup and restore behavior are unchanged.
