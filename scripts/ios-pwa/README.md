# Installed iOS PWA backup regression

This is an opt-in native test using Appium/XCUITest and two new iPhone 16
simulators. It operates Settings and native Files dialogs, then inspects native
IndexedDB records independently. It never targets an existing simulator, physical
phone, browser profile, or production origin.

## Run

Use macOS, full Xcode with its first-launch setup completed, an installed iOS
Simulator runtime, OpenSSL, and the Node version in `.nvmrc`. iOS 26.5 with Xcode
26.6 is the validated configuration. No Apple account or physical phone is needed.

Install dependencies once:

```sh
npm ci
npm ci --prefix scripts/ios-pwa
```

Run the complete native scenario:

```sh
npm run test:ios -- --runtime com.apple.CoreSimulator.SimRuntime.iOS-26-5
```

The command copies the current working source to an isolated build directory,
including local changes. It omits `.env*` files and uses a sandbox directory for
server filesystem state during both build and startup. Dependencies are cloned
on APFS. The normal development server and build output are untouched.

For a faster rerun, explicitly supply an isolated production build made with
`BASE_PATH=/artbot`:

```sh
npm run test:ios -- --build-dir /absolute/path/to/isolated-build
```

To investigate destination recovery without repeating the native export, replay
the saved synthetic files from a previous run:

```sh
npm run test:ios -- --build-dir /absolute/path/to/isolated-build \
  --saved-run /absolute/path/to/ios-pwa-runs/run-example
```

Replay requires a successful synthetic source import audit and external-file
audit in that report, then rechecks every saved-file SHA-256 before copying.
It creates a new destination simulator and records the source report path.
It does not repeat or establish source save/lifecycle acceptance for the new
build. Use the full run for release verification.

No existing server URL or device ID can be supplied. Each run starts new loopback
HTTP/HTTPS and Appium servers on free ports, generates a two-day test certificate,
and trusts it only in the newly created simulators. It does not modify Mac or
physical-iPhone certificate trust. API stubs and a test-only Content Security
Policy prevent the native app from contacting Horde or other external services.

## What it proves

1. Import a synthetic legacy archive through the native Files picker. The fixture
   has all nine tables, 12 records, a favorite, a 7 MiB source Blob and a mask.
2. Prepare a manifest and multiple parts. Share each actual file to On My iPhone.
   Reject extra files, renamed/duplicate parts, wrong lengths or wrong checksums.
3. Verify the manifest alone, terminate the Home Screen app, relaunch its icon,
   then shut down and boot the simulator. Follow Continue backup with the same
   backup ID and partial progress. Cancel the native verification picker and
   reject a damaged saved part without advancing progress.
4. Verify each remaining valid saved part. Copy only the external files to host
   artifacts, then terminate the source app and shut down its simulator.
5. Install the PWA on a second, newly created simulator. Assert that its library
   is empty and that no selection, preparation jobs or handoff state exists.
6. Transfer only the saved files into its Files provider. Verify them without a
   local preparation, restore them, and check every table count, favorites,
   source/mask SHA-256 hashes, a saved preference and restored-job quarantine.
7. Terminate/relaunch the restored app and repeat the audit. Cancel the native
   restore picker, reject missing/damaged sets in both verification and restore,
   and prove the populated library and verification timestamp remain unchanged.
   Error checks are scoped to the verifier or restore panel. If repeated native
   selections lose file access before hashing, require explicit reselect/reopen
   guidance and record that I/O error separately from checksum rejection.
8. Cold-reopen the app and require checksum rejection of the damaged bytes.
9. Reopen after the errors and retry the valid files. Roll back to the preserved
   populated library, then roll back again to the original empty library and
   its original preferences.

Only exported files cross between simulators, via host artifacts. The receiver
saves those bytes through the native Share → Save to Files dialog, with an
independent size/SHA-256 check for each saved file. The synthetic legacy input and
damaged test copies use the same native transport. A temporary test-only overlay
supplies one ready File and a fresh share tap; it sits outside React, never calls
the backup manager or writes IndexedDB, and is removed after transfer. The receiver's
raw database is independently checked unchanged before and after transport.

Do not seed documents by writing into `File Provider Storage` from the host.
That setup reproduced zero-byte/NotFoundError selections in a plain input after
app restarts despite intact on-disk bytes. Native-saved copies also reproduced
unavailable selections; native receipt exercises the real save path but does not
guarantee that subsequent native handles remain readable. It does not test AirDrop, iCloud synchronization or file placeholders.
Browser-side DOM access navigates and waits for a replacement Settings document
with an open application database and ready file controls; it cannot satisfy that wait using the previous page's
DOM. Saving and file selection use native dialogs. Each picker selection is checked against the exact
requested filenames after native dismissal and asynchronous delivery. Every
native fixture is nonempty. Zero-byte deliveries fail at the file boundary.
A provider can also omit a checked document entirely: a recorded native picker
showed all three files checked while its web FileList contained only the two
readable parts. After waiting for asynchronous delivery, the adapter classifies
only a nonempty strict subset as `IncompleteNativeFiles`; unexpected/duplicate
names and empty selections remain hard failures.

These two recognized delivery failures may enter the bounded UI recovery path:
require the affected panel's unavailable-file or incomplete-set guidance, audit
unchanged library/progress independently, then select the saved set afresh.
A second delivery failure closes/reopens the app; a third fails the run.
`providerRecoveries` records the failure kind, missing/received names when
available, and each unchanged-state audit. Restore itself is never retried by
this mechanism, every successful selection must deliver the complete requested
FileList, and all checksum checks remain mandatory. Native
selection screenshots are retained to distinguish picker/provider problems from
verifier errors. The runner loads one prepared file before its separate share
tap, and accepts missing-file rejection in the restore preview while requiring
same-length damaged bytes to reach independent checksum validation. Fixture setup uses the real Settings importer.
The audits read raw IndexedDB and do not call the backup manager to manufacture
or restore data.

## Results and cleanup

Each invocation writes a report, expected values, saved files, step screenshots,
native accessibility XML and logs to `__local_db/ios-pwa-runs/run-*/`. All are
ignored by Git. `report.json` contains simulator/runtime identity, the served
artifact directory, Next build ID, export-page source hash, step outcomes,
restored values, native transfer size/checksum receipts and cleanup results.
Failure reports also record selected-file byte probes, raw library state and
on-disk external-file sizes/checksums, so a provider failure is distinguishable
from corrupted saved data. Its checkout status describes the runner;
when `--build-dir` is supplied, the artifact may contain different app source.
A failure exits nonzero.
The runner deletes only simulators it just created, stops its own servers, and
handles SIGINT/SIGTERM. SIGKILL or a Mac crash cannot run cleanup; the report lists
the owned UUIDs for targeted recovery. Test certificates/private keys remain
only in ignored run artifacts and are excluded from CI uploads.

Appium, the driver registration and compiled WebDriverAgent cache are isolated
from any global Appium installation. Dependency versions are locked in this
directory. The local cache is `__local_db/ios-pwa-tools/`.

The existing `Test` workflow runs `e2e/freshBackupRestore.spec.ts` in Chromium,
Firefox and WebKit on PRs. The separate **Native iOS PWA backup** workflow is
manually dispatched before backup releases, using `macos-26`, Xcode 26.6 and
iOS 26.5. It uploads a whitelist of synthetic reports/screenshots/logs, including
on failure. Hosted-runner execution is distinct from local validation.

## Remaining acceptance

The browser fresh-install test also injects unreadable-file errors, exhausted
storage estimates and denied persistence responses and checks preservation plus
a valid retry. Those are simulated platform responses, not iCloud placeholders,
a full disk or a physical-device quota.

This fixture is intentionally modest. Large-library physical-iPhone memory,
locking/backgrounding at every commit boundary, physical-device reboot, actual
low storage, persistence behavior, installed-app code updates, and
iCloud/Downloads provider behavior remain separate tests. A simulator shutdown
and boot is distinct from restarting a physical phone. The
original installed phone library stays untouched until an independent complete
backup is verified.
