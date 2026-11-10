# Comparing an upgrade with production

Use two isolated **production builds** and fresh copies of the same sealed
Chromium profile. This supplements the normal end-to-end suite with the state
real users accumulated on `https://tinybots.net/artbot`.

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

The old full-database import added rows into an existing database, causing primary-key conflicts. Replacement now clears all tables inside the importer's transaction, using its first row callback; invalid imports roll back the clears and writes together. A valid empty backup is validated before an atomic clear. The importer still streams Blob reads. Before opening the replacement transaction, a streamed framing check rejects a truncated export; the library can otherwise accept an incomplete file as a successful partial import. Avoid the library version's `clearTablesBeforeImport` option here: it clears data before opening the import transaction. The positive restore, duplicate-key failure, and truncated-file tests protect these paths.

The API is described in the [Dexie import/export documentation](https://dexie.org/docs/ExportImport/dexie-export-import).

An outage during an unacknowledged POST is different from interrupted polling:
the service may have accepted the work before the connection failed. The HTTP 503
case tests explicit user recovery; the profile restart case interrupts polling
only after every POST is acknowledged. Do not claim automatic exactly-once
submission across an ambiguous network failure.

Remaining separate scenarios include full storage/quota exhaustion, installed
PWA/service-worker upgrades, actual mobile Safari and clipboard, much larger
full-resolution libraries, and long-idle queues under the existing 30-minute
cleanup policy. A passing matrix is evidence for these cases and artifacts,
not a guarantee for every browser state or a substitute for gradual release.
