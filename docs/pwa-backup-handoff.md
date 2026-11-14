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
   Native file sharing sends only the selected file. On iOS, adding a share title
   also saves an unwanted text file alongside the backup.
3. Under **Verify saved backup**, select a few saved files or the whole set.
   Each successful batch records which files match this preparation's exact names,
   sizes and checksums. Failed or cancelled batches do not advance verification.
   The native selection stays attached between operations. It is cleared only
   before opening the next verification picker, allowing the same files again.
   If iOS makes a selected file unreadable, ArtBot reports that separately from
   a checksum mismatch and gives reselect/reopen guidance. Neither failure
   verifies the files or activates a restored library.
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
semantic audit before declaring success. Settings now opens a metadata inventory
and the small manifest, and constructs a data part only when selected. Selecting
another file replaces the page's retained prepared File. Folder export reads
and streams parts sequentially. Native sharing uses a separate tap on the ready
file to preserve iOS user activation. Download URLs remain alive briefly for
Safari's Files handoff; peak native memory still needs physical-device profiling.
This does not promise a particular memory ceiling or eliminate many-file saving.

## Guided Settings page

- Back up appears first, with Prepare, Save files and Verify copies stages.
  Section links, a next-file action and a collapsible inventory support large
  backups while keeping save requests distinct from verified copies.
- Restore first previews the manifest's date, image/record counts, part inventory,
  credentials and estimated storage. Missing files, size mismatches, unreadable
  manifests and insufficient estimates block the restore button. Legacy preview
  uses file metadata without parsing the archive. Restore independently checks
  all content before activation; preview never records verification.
- One page operation gate coordinates backup, preview, restore and image ZIPs.
  A paused preparation or restored library remains available for recovery.
- Part size, credential export, persistence diagnostics, local preparation
  cleanup and compatibility JSON are under Advanced. Unfinished preparation and
  restore actions remain discoverable. Image ZIPs have a separate collapsed area.
- Image ZIP ranges use zero-based offsets and complete lengths, including the
  first and last images. ZIP downloads use the common Blob URL cleanup path.
  Footer links do not prefetch unrelated routes during this work.

## Large libraries, remaining work and cleanup

Resuming preparation uses the preparation's saved part limit, reserves bounded
part workspace and checks headroom before each additional record write. It does
not reserve another complete copy of origin storage that already includes the
checkpoint. New preparations retain their conservative initial estimate.

Multipart restore records serialized input bytes only after each native record
commits or an existing record's fingerprint matches. Preview and restore credit
that checkpoint only for the same manifest and source selection. Rechecking
earlier rows cannot reduce committed credit. Older checkpoints without byte
metadata retain the full estimate. Space estimates remain advisory; a real quota
error still leaves the selected library intact and the candidate recoverable.

Integrity audits use the same graph and digest algorithm as the v1 writer, but
do not construct serialized backup Blobs or base64 strings for binary payloads.
They still reread the source and committed candidate independently. Large-payload
audits check cancellation between chunks. On this Mac, an alternating five-sample
comparison with the preceding commit's encoder and an 8 MiB source measured
median fingerprint time of 129 ms versus 1,073 ms, with matching fingerprints and
zero serialized Blob allocations versus 72. This is a synthetic desktop result,
not physical-iPhone memory or throughput acceptance.

Advanced preparation management shows prepared byte counts. Retained-library
management shows restored record counts and, where recorded, serialized backup
payload sizes; these are not physical database disk measurements. Deletion
requires confirmation and the engine refuses to delete the active/default
library or a library referenced by another recoverable restore. Cleanup is
explicit, never automatic, and rollback itself removes no library.

Cancelled native sharing removes that file's save-request hint after the pending
request is recorded, returning next-file guidance to the cancelled file without
changing verified-copy progress. Saved and verified copies remain distinct.

Image ZIP export reads primary keys first and one image at a time, converts each
image only when the ZIP stream requests it, and reports included/skipped counts.
On browsers exposing a native file destination, **Save ZIP directly** streams to
that destination. Other browsers still materialize one final ZIP Blob for the
download. Cancellation, backgrounding and unmount stop ZIP work; cancellation
does not mark that range complete. ZIPs do not replace a complete library backup.

## Regression coverage

- Manager tests cover reopen between batches, corruption, atomic rejection,
  cancellation, localStorage quota, concurrent verifiers, native Blob/mask fidelity
  and v1 compatibility.
- `e2e/backupPage.spec.ts` checks metadata-only reopening and selected-part loading
  at the File API boundary, missing-part preflight, competing-operation disabling,
  downloaded ZIP contents, sequential folder writes and the absence of unrelated
  footer prefetches.
- `e2e/fixtures/backup-v1.json` is a frozen, synthetic format-v1 artifact containing
  binary sources, a mask, a favorite, a Date, undefined and unknown fields. Keep
  it unchanged when updating the writer; add new fixtures for future formats.
- `e2e/backupHandoff.spec.ts` downloads actual files, verifies separate batches,
  closes/reopens the browser at a narrow viewport, follows the home-page reminder, then restores and
  rolls back while checking source/mask bytes and favorites.
- `e2e/freshBackupRestore.spec.ts` closes the source profile and uses only its
  downloaded files to verify, restore, reload and roll back in a separate empty
  profile. It checks that no source preparation catalog is present, and audits
  native table counts, favorites, Blob hashes, preferences and paused requests.
  Once populated, the destination rejects missing/damaged backups without
  changing its selection or last-verification timestamp, then retries valid
  files and rolls back through both prior libraries. Exhausted storage estimates
  and denied persistence are injected platform responses in this browser test;
  unreadable-file coverage also injects a File API error. These do not establish
  actual low-storage or iCloud-provider behavior on an iPhone.
- CI runs the focused handoff, multipart, startup recovery and database roundtrip
  suites in Chromium, Firefox and WebKit, in addition to the existing full
  Chromium suite. Browser installation is pinned by the package lockfile.
- Storage tests cover committed-byte credit, pausing during revalidation,
  insufficient remaining space, and the actual resume preview/activation UI.
  Cleanup tests protect rollback dependencies and exercise rejected/confirmed
  deletion. Browser checks also exercise sharing cancellation and sequential ZIP
  streaming, skip reporting and cancellation through simulated platform APIs.
- Failed-attempt traces are uploaded even when a retry succeeds. The cold-reopen
  test attaches navigation, failed-request and page-error diagnostics; CI also
  repeats it three times in WebKit with retries disabled. Eight local WebKit
  control repetitions passed without retries; the earlier Linux prefetch
  access-control error has not been reproduced locally and is not claimed fixed.

## iOS Simulator verification

On November 12, 2026, an installed Home Screen app on an iPhone 16 simulator
running iOS 26.5 passed the native Files round trip using Appium/XCUITest and the isolated HTTPS build:

- Imported a synthetic legacy backup through the native picker: 12 records
  across all nine tables, including a favorite, a 7 MB source Blob and a mask.
- Prepared a manifest and two parts; saved the manifest using its preview and
  Share → Save to Files, and saved both parts using the native share sheet.
- Verified the saved manifest alone, terminated the app process, relaunched its
  Home Screen icon and followed Continue backup with the same backup ID and
  1 of 3 files verified. Verified the remaining saved copies separately.
- Restored all three actual saved files through the native picker, then returned
  to the previous library. Table counts, favorites and source/mask SHA-256 hashes
  matched after both restore and rollback.
- Native sharing initially saved the supplied share title as `text.txt` as well
  as the part. A file-only share was retested in a fresh Files folder: exactly one
  backup part was saved, matching the original part byte for byte.

The initial exploratory scripts and results are in the ignored
`__local_db/local-pwa/automation/` lab. The maintained
[native runner](../scripts/ios-pwa/README.md) now creates two disposable installed
PWAs, drives native Files dialogs, shuts down the exporting simulator and proves
recovery from only the saved files on the fresh destination. It records failure
artifacts and cleans up its own devices and servers. A separate manual macOS CI
workflow runs this scenario; the fresh-profile browser test also joins normal PR
CI in all three engines. Simulator storage and memory behavior do not establish
physical-device acceptance.

The maintained runner completed two unattended source/destination runs on iOS
26.5, including recovery against a newly built isolated production artifact. Both
runs verified that the destination had no source preparation state, restored
only actual saved files, retained the restored selection after relaunch and
returned to an empty library on rollback. The GitHub native workflow has been
added but has not yet been executed on a hosted runner.

Failure testing exposed a native file-input lifetime issue. Clearing the input
before asynchronous reads produced **The object can not be found here** during
verification; a control rerun reproduced it with the same bytes and driver.
Keeping the selection attached allowed verification to reach the checksum.
Clearing immediately after verification still lost access during later restore
selections. The final change resets only before the next picker opens and keeps
the selection attached between operations. Unreadable files receive a separate
I/O rejection, with explicit reselect/reopen guidance.
The native runner records the actual restore-panel error and independently checks
that the selected library and verification timestamp remain unchanged. A separate
cold-open damaged restore must reach the checksum rejection; a verifier's message
elsewhere on the page cannot satisfy that restore assertion.

Before the guided Settings page changes, the maintained runner build passed a
16-step destination replay and a complete 25-step source/destination run on iOS 26.5. The full run included simulator shutdown/boot
with partial progress, native picker cancellation, saved-file checksum audits,
fresh-install recovery, missing/damaged-file rejection in the correct panels,
cold-open checksum rejection, valid retry and both rollback levels. The damaged
restore reached the real checksum error in both final runs. All nine table
counts, source/mask hashes, favorites, preferences and paused selection state
matched; both disposable simulators were cleaned up. That earlier build also passed
12 focused browser checks across Chromium, Firefox and WebKit, all 549 unit
tests run serially, typecheck and changed-file lint. The manually dispatched
GitHub native workflow remains unexecuted on a hosted runner.

## Guided page validation

The recovery production artifact passed 69 browser checks across Chromium,
Firefox and WebKit, all 550 unit tests, typecheck and changed-file lint. This includes the
1,700-row synthetic library round trip. The folder check supplies a simulated
directory-picker API and audits every written byte; it does not prove a real
OS folder or iCloud provider. File construction is observed at the browser API
boundary to confirm that reopening the inventory builds no data-part Files and
selecting a part builds only that part.

Native validation exposed intermittent zero-byte selections after repeated app
restarts. A plain input outside React reproduced the same failure while on-disk
sizes and SHA-256 hashes remained intact. Both host-created and native-saved
copies reproduced it, so native receipt alone does not eliminate the failure.
The precise native cause remains unconfirmed; it reproduces outside the
application's file handlers.

Fixture documents now arrive through native Share → Save to Files instead of
host writes into File Provider Storage. Every receipt is checked independently,
and transport must leave the receiver's database unchanged.

Zero-byte top-level backup files are classified as empty or unavailable, with
explicit reselection guidance, before preview, staging or saved-file verification
can advance. Empty binary fields inside valid backup records remain supported.
Tests require the active library, previous libraries, verification timestamp and
partial verification progress to survive rejection, followed by successful
verification/restore from freshly selected readable copies.

The native picker adapter raises a specific error at a zero-byte delivery. It may follow only
that recognized recovery path: verify guidance in the affected panel, audit that
the database and verification state are unchanged, then make a fresh native file
selection. If necessary it follows the displayed close/reopen guidance once.
Every recovery is recorded in `providerRecoveries`; a third unavailable selection
fails the run. It never retries restore automatically, accepts unreadable bytes as
a checksum result, or manufactures a restored library. Cold-open corruption must
still reach the genuine checksum rejection, and retry/rollback assertions remain
mandatory. Settings navigation waits for a new document, an open application database and
ready file controls, so neither the previous page's DOM nor a constructor whose
database has not opened can satisfy the wait.

A fresh native run must prove delivery of the exact selected manifest and parts
before its verification or restore assertions can pass. The runner records native
selection screenshots and waits for the complete DOM FileList after the picker
dismisses, because native dismissal can precede file delivery.

The complete native run passed all 25 steps with the recovery guards. It
encountered two genuine zero-byte deliveries: during cold-open corruption testing
and during valid retry. In both cases raw library/progress audits matched before
and after rejection; fresh native selections then reached the real checksum
rejection or completed restore. The final UI also passed a separate 16-step fresh
receiver replay, including another unavailable verification selection followed by
a successful fresh choice. Both rollback levels passed. These recorded recoveries
handle an unavailable selection; they do not establish that iOS will never return
an unavailable handle.

The final UI's **Choose backup files again** action opens a fresh picker after
an unreadable/empty preview instead of rereading the same stale File objects.
The 69 browser checks include that exact action through valid verification,
restore and rollback; 550 unit tests, production build, typecheck and changed-file
lint pass. Native evidence is in ignored `run-F6dWFt/report.json` and
`run-xBo3QF/report.json`; all three owned simulators were deleted. The existing
local ArtBot Test origin serves the final recovery UI. Hosted native CI and the
physical-device acceptance matrix remain separate checks.

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
Playwright 1.60.0. TypeScript, changed-file ESLint and all **550 Jest tests** pass.
**69 focused browser checks** passed across Chromium, Firefox and WebKit on the
guided page artifact. The matrix covers the new cold-reopen flow plus existing
multipart, preferences, interruption, restore/rollback, device-probe and manifest
checks in three engines. Private reports and screenshots are under
`__local_db/pwa-backup-handoff/` and the ignored upgrade-comparison artifacts.
The additional fresh-install test passed in Chromium, Firefox and WebKit. No
original phone library or sealed baseline is modified by these tests.

Linux WebKit CI exposed an existing fixture race: a synthetic requested job had
no claim timestamp and was legitimately marked stale before export. Its saved
archive already contained that error state. The test now freezes a valid claim
time during export, then advances the clock three minutes before restore. This
keeps the source fixture stable while testing stale restored-job quarantine
explicitly; production cleanup and restore behavior are unchanged.

The guided-page browser checks use real file-chooser interactions for restore
and saved-file verification. These wait for enabled controls, preventing tests
from assigning files into an input while the page operation gate disables it.
This corrected a Firefox fixture failure without changing timeouts or weakening
restore, checksum or page-error assertions.

## Incomplete native delivery

A later source/destination run saved and independently audited all three files,
but the destination Files provider delivered only two parts after showing all
three documents checked in the native picker. The verifier rejected the missing
manifest and the destination stayed empty; no verification timestamp advanced.
The native adapter now distinguishes that nonempty strict-subset delivery from
zero-byte files, waits for asynchronous completion before classifying it, and
requires the corresponding incomplete-set guidance plus unchanged-state audits
before bounded reselection. Unexpected/duplicate names and empty selections are
not retried. Complete file delivery, actual checksum checks, fresh restore and
rollback remain required. Six Node adapter tests cover the delivery boundary
without requiring Appium or an iOS runtime; they are simulated transport checks,
not native device evidence.
