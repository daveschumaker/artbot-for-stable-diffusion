# Recoverable backups

Approved scope: the Settings backup/import/verification workflow and one shared
backup module, with independent checks of backup artifacts and native restored
records. Normal and emergency paths use that module. Existing phone exports and
sealed browser baselines remain private and unchanged.

Implementation checkpoints:

- [x] Preserve legacy raw-array records without Horde IDs; remove whole-store fallback reads.
- [x] Versioned, type-preserving, byte-bounded backup parts with a complete manifest.
- [x] Durable preparation checkpoints, resume/cancel, source stability checks and honest save status.
- [x] Validated staged restores, recoverable database selection, previous-library rollback.
- [x] Persistent preferences with explicit credential inclusion and runtime-key exclusion.
- [x] Cross-tab write coordination, paused restored jobs and quota/persistence diagnostics.
- [x] Corruption/missing-part/failure/restart/large-payload tests through the agreed interfaces.
- [x] Disposable physical-device harness and installed-iPhone engine check.
- [ ] Physical Files round trip and installed-PWA update/lifecycle acceptance checks.

The original database is never cleared during staged restore. A candidate is
imported in bounded transactions, audited, then selected using one small durable
selection record containing only library metadata. Preferences are staged in
IndexedDB first. A small localStorage recovery journal makes replacing the active
preference keys and publishing the selection recoverable across interruption.
The old database and its preferences remain available for rollback. Other
current-version windows close their old connections and reload after selection
changes. Startup repairs any unfinished journal under the same cross-window
lease before rendering the application.

Preparation stores complete serialized records in a separate checkpoint database.
Record commits and cursor advancement share a transaction. Interrupted preparation
resumes after the last committed primary key and rechecks the source. Download
parts are assembled from bounded Blob segments, with part checksums and record
fingerprints in a final manifest. Download requests are not labeled verified until
the user selects the saved files and the verifier checks them.

Legacy Dexie JSON stays readable. Historical plain JSON arrays are explicitly
recovery/merge input: stage a copy of the existing library, merge without requiring
`hordeImageId`, report duplicates, then activate the verified result. New snapshots
use raw native records, bypassing application reading hooks. Logical backups do
not reproduce browser counters, cookies, keychains or installed-app lifecycle.

## Saving across PWA restarts

Prepared backups support saved-file verification in separate batches. A home-page
**Continue backup** link returns to the exact preparation after Files recreates
the app document. Save requests and verified saved copies remain distinct.
See [the PWA handoff workflow](pwa-backup-handoff.md) for durability, compatibility
coverage and the remaining physical-device acceptance checks.

## User workflow

In Settings → Import / Export, choose **Prepare backup**. The default maximum
part size is 8 MiB; 32 and 64 MiB are available. Save the manifest and **every**
part into the same folder outside browser storage. On supported desktop browsers,
**Save all to a folder** streams files to the chosen directory. Elsewhere, save
each file separately. When file sharing is available, **Share/save** opens the
native share sheet; choose Save to Files on iPhone. Feature detection follows the
[Web Share API](https://www.w3.org/TR/web-share/#sharing-a-file). A download request is not evidence that Files or Downloads
retained the file. Select the saved manifest and parts under **Verify saved
backup**; only this action records the last saved-file verification timestamp.
The manifest includes a part inventory, native schema, table counts and chained
record digests. SHA-256 detects accidental corruption; it does not authenticate
a file's author. Treat private backups as private files.

All source images, masks and unknown record fields are retained. The graph codec
preserves Blobs, Files, dates, ArrayBuffers, typed views and shared buffers,
sparse arrays, Maps/Sets, undefined, numeric edge cases and cycles. Unsupported
structured-clone types fail explicitly. A single unusually large non-Blob record
still sets the browser's minimum memory requirement. Large metadata may require
a new preparation with a larger part size. Logical snapshots do not retain the
native auto-increment high-water mark after deletions.

API keys and other credential-named preferences are omitted by default. Inclusion
and restoration are separate opt-ins. Otherwise restore keeps the destination's
keys. Persistent `appConfig` preferences and an explicit allowlist of favorite/recent
LoRAs and embeddings, custom dimensions, canvas/ControlNet input, gallery layout
and sort are backed up. They are chunked into the data parts, so a large saved
source image cannot inflate the manifest. Never copy activity, window-election,
pending heartbeat or other arbitrary localStorage keys. Legacy
JSON did not contain these preferences, so its restore retains current settings.
Compatibility JSON remains readable by older ArtBot versions, but its one large
file is an optional desktop workflow and does not solve mobile save-memory limits.

Downgrading server code is separate from **Return to previous library**. The
deployed legacy build always opens `imageHorde` and ignores the selected restored
database and restored-job quarantine. Newer images in a restored library remain
retained but are not automatically visible to that build. Before downgrading,
follow [the staged-library handoff](release-checklist.md#downgrading-after-a-staged-library-restore):
verify saved backups, settle pending requests, and test compatibility JSON in a
fresh legacy profile if its newer contents need to be accessible there. Do not
import over the original populated library or delete browser storage to force
the handoff. Compatibility JSON does not carry localStorage preferences.

Restore selects an audited candidate only after its committed native rows match
the input. No existing image library is cleared. Preference snapshots live in
IndexedDB rather than inflating the selection record. Activation replaces the
active localStorage preference values once, with a durable journal that can
restore the prior values if activation fails. It does not require room for two
copies of a large saved input in localStorage. Backups from another device must
still fit the destination's own preference quota. Other current-version tabs
reload after the selection generation changes. The previous library can be selected again with **Return to previous
library**. Restored pending requests are quarantined until **Resume restored
requests**, because resubmitting an old request can spend credits twice.
A multipart restore can resume after cancellation or a storage failure. Reselect
the same files in **Incomplete restores**. Legacy JSON restores safely restart
from the file rather than claiming resumability. Legacy Dexie parsing pauses
before each input chunk until the preceding chunk's fingerprint work finishes.
Its memory bound is one parsing chunk plus the largest individual record and
verification metadata, rather than an archive-sized queue of image encoders. Historical raw arrays merge
into a staged copy of the current library, deduplicate by `jobId` while preserving distinct Horde image IDs or image bytes, reassign
colliding local numeric IDs, retain rows without Horde IDs, and report skips.

Checkpoint data occupies extra browser storage. Persistence requests and quota
estimates are advisory. Quota errors leave the current library selected and the
last durable checkpoint available; make space or remove an incomplete attempt
before retrying. Removing a preparation does not delete downloaded copies or
images. Previous libraries are retained for recovery and are not automatically
pruned. Rollback removes no library. Storage eviction, Clear Website Data or
removing an installed app can remove all browser-resident copies together.

Keep the source idle and close older ArtBot windows while preparing. The new
application coordinates writes using a durable cross-window lease and fences
operations that outlive the lease. An old deployed build or third-party native
writer does not participate. A second source read rejects detected changes; it
cannot turn uncooperative writes into a transactional point-in-time snapshot.
Use a fully closed browser-profile copy when testing internal counters, cookies,
service workers, caches, or browser storage behavior. Keep a sealed baseline and
create a disposable clone for each scenario.

## Repeatable verification

```sh
npm test -- --runInBand app/_backup
npm run typecheck
npm run build
E2E_PORT=34761 E2E_SKIP_BUILD=1 E2E_ALL_BROWSERS=1 npx playwright test \
  e2e/databaseRoundtrip.spec.ts e2e/recoverableBackup.spec.ts \
  e2e/deviceBackupProbe.spec.ts e2e/libraryRecovery.spec.ts --workers=3
```

Use a free port; an explicit `E2E_PORT` refuses to reuse another server. Browser
checks use isolated persistent profiles because ephemeral desktop WebKit Blob
storage has failed independently of ArtBot. No Horde requests are sent.
The multipart test defaults to 36 MiB of binary payloads, not thousands of tiny
thumbnails. For a gigabyte-scale run:

```sh
BACKUP_STRESS_ROWS=22 BACKUP_STRESS_BYTES=50331648 \
E2E_PORT=34764 E2E_SKIP_BUILD=1 npx playwright test \
  e2e/recoverableBackup.spec.ts --workers=1
```

The optional `ARTBOT_PHONE_BACKUP=/private/path/to/archive.json` test in
`e2e/phoneBackupRestore.spec.ts` first verifies the recovered file's known hash,
then exercises the real Settings importer in a new profile. It checks all nine
store counts, favorites, source/mask counts and the 753 historical records
without Horde IDs. Private archives, credentials, pairing records, test profiles
and traces must stay outside Git.

## Physical iPhone checks

Validation recorded on 2026-11-11 (see [the PR validation record](pr-validation.md)
for the later review fixes and full matrix):

- 132 focused unit/integration tests, type checking, targeted lint and a production
  Next.js 16 build passed.
- 33 browser checks passed across Chromium, Firefox and persistent WebKit,
  including recovery of the same prepared set after a document reload.
- A 1.03 GiB synthetic binary corpus completed preparation, saved-file verification,
  restore and rollback in approximately seven minutes on desktop Chromium.
- The recovered 979,780,396-byte phone archive restored through Settings. An
  independent audit matched all 1,823 restored record fingerprints against the
  original recovery evidence, including binary fields; rollback also passed.

These results do not complete the physical Files or installed-app update checks.

Build an injectable device-engine probe with:

```sh
node scripts/backup/build-device-probe.mjs /tmp/artbot-backup-device-probe.js
```

In the installed app's Web Inspector, evaluate that file, then run
`await ArtBotBackupProbe.run()` (or observe its Promise/result using the Inspector
protocol). `ArtBotBackupProbe.progress` reports the current phase. It creates
only UUID-named disposable source/catalog databases and uses an in-memory
selection/preferences adapter. It never opens the user's `imageHorde` database
or changes their localStorage. It checks cancelled preparation, manager reopen,
resume, bounded parts, corruption rejection, cancelled/resumed staged restore,
raw-field/Blob integrity and rollback, then deletes its temporary databases.
If the phone disconnects, leave it foregrounded so its finally cleanup can run;
inspect remaining `artbot-device-probe-*` databases before manually removing
anything. Do not delete a database based on a broad name pattern.

A temporary Files-test panel is also available as
`await ArtBotBackupProbe.openFilesTest()`. It creates three synthetic source
images in its own databases. Save its manifest and three parts into iPhone Files,
return to the panel, choose those saved copies, then tap **Verify and restore
saved copies**. The panel verifies the files and independently checks a restored
Blob hash, favorites and masks, rolls back and removes its temporary databases.
It uses only its in-memory selection and cannot select or modify the app library.
`ArtBotBackupProbe.filesResult` reports completion. Close the panel afterward.
This allows the Files handoff to be exercised without deploying new production
code or importing into the original phone library.

The probe passed in the user's physical standalone iPhone app on 2026-11-11
with three 1 MiB source Blobs. This is engine-level evidence, not completion of
the Files, installation, or upgrade workflow. Before shipping, use a **disposable
HTTPS Home Screen installation** for these remaining acceptance checks:

- Prepare a large multipart backup; save every file through iPhone Files, quit
  and reopen ArtBot, select those saved files and verify them.
- Restore those copies, inspect source images/masks/favorites and every gallery
  page, quit/reopen, then roll back. Keep the original phone installation intact.
- Background/lock/terminate during preparation and during restore, then reopen
  and resume; confirm no half-selected library or duplicate image submissions.
- Exercise low storage and declined persistence, Files cancellation and a missing
  or damaged part. Confirm the original remains usable and errors are actionable.
- Keep the disposable Home Screen icon installed while switching the trusted
  test server from legacy code to the candidate at the same origin/path. Test
  open, backgrounded and cold launches, uploads, ControlNet, inpainting,
  pagination, favoriting and restored pending-job quarantine.

See [PWA regression checks](pwa-regression.md) for the broader physical-device
matrix. No production deployment or migration of the original phone library is
part of this implementation.

The WebKit probe exposed substantial per-call overhead reading disk-backed Blobs.
The readers now use bounded 1 MiB I/O windows independently of serialization
chunks. A 12 MiB fixture took about 37 seconds to read in 128 KiB slices versus
7 seconds in 1 MiB slices on desktop WebKit. Hashing was negligible. A public-API
regression test checks both peak read size and read count. Desktop WebKit remains
slower than Chromium; these timings are not an iPhone throughput promise.

iPhone download links were observed recreating the Home Screen app document
after Save to Files. Completed preparations remain in IndexedDB and Settings now
automatically reopens the latest complete set. Both Settings and the disposable
panel have regression coverage for saving the manifest, recreating the document,
then continuing the exact same filenames and checksums. Download requests remain
unverified until saved copies are selected. File pickers deliberately omit
`accept` filters: WebKit has reported disabling custom extensions when mixed with
JSON ([WebKit issue](https://bugs.webkit.org/show_bug.cgi?id=34442)); format,
count and checksum validation still happens before a library can be selected.
