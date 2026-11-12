# Comparing an upgrade with production

Use two isolated **production builds** and fresh copies of the same sealed
Chromium profile. This supplements the normal end-to-end suite with the state
real users accumulated on `https://tinybots.net/artbot`.

For a deployed `/artbot-beta` artifact, use the read-only relay, per-lane base
paths and workflow runner described in [the beta validation runbook](beta-validation-2026-11-11.md).
The [paired performance report](beta-performance-2026-11-11.md) records the
controlled legacy/beta measurements and their limits.

The first comparison uses the user-confirmed deployed control `1bd51aae`
(production reported build `202508182305`) and the `manual-workflows` baseline:
43 completed images, six old errors and two old completed pending records.
The control is a local build of that source commit, not the original deployed
binary. Source changes made after preparing a candidate require another build.

## Prepare the servers

Create detached worktrees **outside** the repository to avoid inheriting its
ESLint plugins or Next lockfile discovery. Install each worktree's own lockfile
with `HUSKY=0 npm ci`. Include the intended candidate's working changes explicitly;
record the commit, binary patch digest, lockfile digest, Node version and build
markers. Do not copy `.env` or private server configuration from production.

Build and start control on 3297 and candidate on 3298 with `npm run build` and
`npm run start -- -p PORT`. Keep their build directories and server data separate.
Use these environment values for **both build and start**, with distinct data
directories for each lane:

- `NEXT_TELEMETRY_DISABLED=1`
- `ARTBOT_TEST_DATA_DIR`: an absolute, private test directory created beforehand.
- `NODE_OPTIONS`: `--require /absolute/path/to/scripts/upgrade-comparison/server-sandbox.cjs`

The preload redirects `os.homedir()` only inside the isolated Node process, so
ArtBot's server-side settings and counters stay in the test directory. Each
worktree should have an empty `.env`. Stop on a port collision; do not attach to
an existing development server. The normal development server can remain on 3199.

## Run the comparison

From this repository, with the matching Playwright Chromium installed:

```sh
node scripts/upgrade-comparison/compare.mjs
```

The runner uses the profile lab's local HTTPS gateway. Both lanes retain
`https://tinybots.net` as their browser origin, but application traffic goes to
the corresponding local server. External services are mocked at the browser
boundary; it makes no live Horde connections or paid generation requests.
Service workers remain enabled. This baseline has no installed service worker.

It checks:

- Two application open/close/reopen cycles, original image rendering, all native
  IndexedDB schemas and record hashes, plus persistent localStorage settings.
- All 43 original image records, including source, mask, canvas and encoded image
  data, remain byte-identical. Native Blob and binary bytes are hashed as well.
- Only the two old `done` pending rows disappear during startup cleanup; the six
  original errors remain. Heartbeats and tab-election values may change.
- A real UI request for ten images survives navigation, reload, interrupted
  polling, browser restart, a second tab and closing the primary tab.
- Exactly ten acknowledged Horde submissions, ten unique saved jobs and a shared
  batch parent, with original records preserved. The first five fixture jobs are
  released to allow the app's concurrency limit to admit the remainder.
- Every scenario leaves the sealed baseline's profile-tree hash unchanged.

Useful focused commands:

```sh
node scripts/upgrade-comparison/compare.mjs --no-op-only
# For another populated, idle baseline, also set --baseline and --expected-images.
node scripts/upgrade-comparison/compare.mjs --lane candidate
node scripts/upgrade-comparison/compare.mjs --batch-only --reload-only --lane candidate
node scripts/upgrade-comparison/large-library.mjs
# Both scripts take --control and --candidate URLs to test other servers.
node scripts/upgrade-comparison/rollback.mjs /absolute/path/to/comparison/report.json
# Expanded production-generated corpus, including favorites and partial pages:
node scripts/upgrade-comparison/gallery.mjs --candidate http://127.0.0.1:3298
node scripts/upgrade-comparison/compare.mjs --baseline production-pagination-favorites --expected-images 245 --lane candidate
```

Rollback copies the **closed** candidate profile after a successful ten-image
batch, serves the control code, displays a newly generated image and requires
all 53 completed records to retain identical bytes and database versions. It
never rewrites the candidate source profile. The large-library test adds 957
synthetic 512px images to the original 43, checks gallery/detail rendering and
preserves all original record hashes. Its timings are smoke observations, not a
performance benchmark or a simulation of a thousand full-size user images.

Reports and failure screenshots go under the ignored, private
`__local_db/upgrade-comparison/results/`. Record digests contain no raw prompts,
API keys, source images or localStorage values. Do not publish profile folders;
they contain the user's actual credentials and image library.

The expanded `production-pagination-favorites` baseline contains 245 real
production-generated images and 60 favorites. At 50 images per page that is five
gallery pages (last page 45), two favorite pages (last page 10), and four
unfavorited pages (last page 35). It retains the original uploaded-image,
ControlNet, mask, canvas and batch cases, plus three Depth ControlNet dog
tributes. The original JPEG and successful renders are kept privately beside
the snapshot. There are no active jobs; failed legacy/worker requests remain as
error fixtures. Extra outputs were retained after the legacy site's two-tab
submission bug appeared during capture.

`gallery.mjs` visits every page of all three views in both builds, compares the
actual displayed IDs with IndexedDB and checks that browsing changed no saved
image or favorite bytes. It always uses disposable clones and verifies the
sealed profile's hash. Re-capture under a new name when extending a baseline.

## Fresh-state browser coverage

Install the browser revisions matching this checkout's Playwright version:

```sh
PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install chromium firefox webkit
ARTBOT_E2E_RUN=final npx playwright test -c scripts/upgrade-comparison/playwright.config.ts
```

This config connects to the explicitly started candidate production server on
`http://localhost:3298`; it never starts or reuses a dev server. Override it with
`ARTBOT_E2E_TARGET=http://localhost:PORT`. `ARTBOT_E2E_RUN` gives each run a separate
JSON report and artifact folder. The default is two workers and no retries.

All existing app, canvas, source-upload, inpainting, ControlNet, upscaling,
download/metadata, import, gallery and settings tests run in the three real
engines. Queue recovery also tests cancellation, automatic HTTP 429 recovery,
explicit HTTP 503 retry, and activity tracking before the first heartbeat.
Full database recovery also tests replacement over existing records, atomic rollback of an invalid backup, empty backups, and a nested 1 MB Blob. These tests use disposable persistent browser profiles so native Blob files can be stored in the tested WebKit revision.

Two existing clipboard tests require Chromium permissions and are excluded from
Firefox and WebKit. Their Safari user-agent branch is not native Safari clipboard
coverage. Chromium profile copies cannot be used in other engines; these tests
use fresh logical fixtures instead. WebKit coverage is not an iPhone/PWA test.

The fixtures permit `blob:` and `data:` resources. Network blocking applies only
to HTTP(S) destinations. Pixel checks convert CSS positions to backing pixels on
Retina canvases. Fixture setup waits for initial prefetches before replacing the
document, avoiding WebKit errors caused by artificial rapid setup navigation.

## Findings to retain

The old activity marker was written only on a five-second interval. Fast
navigation from a profile with an old marker could therefore run stale-queue
cleanup against newly submitted work. Record this visit immediately on startup,
while retaining the previous marker for the existing cleanup decision. The
activity and queued-reload tests protect that behavior.

The old full-database import added rows into an existing database, causing primary-key conflicts. Imports now write to a separate candidate database, audit its native records, then select it. Invalid or truncated input leaves the existing library selected and intact; the previous library remains available for rollback. Legacy Dexie JSON is parsed in bounded chunks, waiting for each chunk's fingerprint work before reading more. See [recoverable backups](backup-design.md) for the selection journal, preference recovery, saved-file verification and restore tests.

The API is described in the [Dexie import/export documentation](https://dexie.org/docs/ExportImport/dexie-export-import).

### Dexie 4

This branch uses Dexie 4.4.7 and dexie-export-import 4.4.2. The deployed site
uses Dexie 3.2.4 and 4.0.7. Both Dexie versions store `version(6)` as native
IndexedDB version 60. Dexie 4 also compares the installed schema with the
declared one when it opens. If a declared table or index is missing, it logs
`Dexie SchemaDiff` and raises the native version to 61. Dexie 3 then requests
version 60, gets a `VersionError` and can't open the library. That breaks a
rollback, so **any schema change must still add a new `db.version()`**.

The migration tests build every historical schema with Dexie 3.2.4 (the
`dexie3` dev dependency). They then check that the current code keeps native
version 60 without a SchemaDiff, and that Dexie 3 can reopen the database
afterwards. Adding an index without a version bump fails four of them with
that `VersionError`.

`e2e/fixtures/legacy-backup.json` is a backup made by the deployed build's own
**Download database** button, written by `e2e/fixtures/makeLegacyBackup.mjs`.
An e2e test restores it and compares every stored row natively, including a
nested Blob and an id gap. Imports use a separate candidate database rather
than the library's nontransactional `clearTablesBeforeImport` option.

Where the browser supports IndexedDB 3 (`getAllRecords`), Dexie 4 calls
`getAll({ query, count, direction })` instead of `getAll(query, count)`.
Tests that check read sizes must handle both forms.

Further tests now cover favorite/unfavorite persistence, filter changes from a
last page, next/previous navigation, partial last pages and page reloads. Filter
changes reset both the URL offset and the state used by the query; using the
old URL offset while navigation is pending can otherwise return an empty page.
Masonry DOM order is column-based, so tests compare page membership without
assuming a row-based DOM order.

Switching tabs while work is still waiting exposed duplicate submissions.
Submission now claims a waiting record in an IndexedDB readwrite transaction,
checks its current job ID, and refreshes stale caches from the database. Saving
completed results also checks for an existing job inside its write transaction.
The browser test switches focus during a held batch and requires exactly ten
submissions and ten saved results. This prevents overlapping live-tab claims;
it does not promise exactly-once recovery after an unacknowledged network POST.

Database export now reads one image row per chunk, rather than the library's
2,000-row default. The 1,700-row export/restore test rejects larger native reads
and verifies all IDs, 850 favorites and a nested 1 MB Blob. Its images are small
fixtures, so this is a bounded-read correctness check, not a phone memory
benchmark. Export failures release the button and preserve the database. See
[the iPhone PWA guide](pwa-regression.md) before attempting to back up an existing
phone installation; actual-device backup and lifecycle testing are separate.

An outage during an unacknowledged POST is different from interrupted polling:
the service may have accepted the work before the connection failed. The HTTP 503
case tests explicit user recovery; the profile restart case interrupts polling
only after every POST is acknowledged. Do not claim automatic exactly-once
submission across an ambiguous network failure.

Backup tests exercise injected storage failures and real localStorage quota
exhaustion. Remaining separate scenarios include full-device storage exhaustion, installed
PWA/service-worker upgrades, actual mobile Safari and clipboard, much larger
full-resolution libraries, and long-idle queues under the existing 30-minute
cleanup policy. A passing matrix is evidence for these cases and artifacts,
not a guarantee for every browser state or a substitute for gradual release.
