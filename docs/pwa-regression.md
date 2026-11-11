# iPhone Home Screen regression checks

Desktop WebKit and a Chromium profile snapshot do not validate an installed
Home Screen app on a physical iPhone. Test the installed app and record the
phone model, iOS version, ArtBot build and test origin.

## Protect the existing library first

The existing iPhone library was recovered on **2026-11-11** from the actual
legacy Home Screen app on iOS 27.2. A readonly, one-record-at-a-time extraction
copied **1,721 completed images, 100 prompts and two settings records** from
`imageHorde` native version 60. It includes 62 favorites, 824 records containing
source images and 15 containing masks. A second source pass matched every
record; a fresh, network-isolated Mac restore matched all **1,823 record
fingerprints**, schema/counts and the captured localStorage snapshot. Eight
restored image samples decoded and were visually reviewed.

The complete Dexie export is 979,780,396 bytes, SHA-256
`373a92c7b9c6d97f25171cf7e02deeaf93fd2ede061553c8e83b3b561f9732ea`.
Private exports, preferences, per-record checksums, the restore report and
contact sheet are Gitignored under
`__local_db/phone-backup/backups/20261111T051357Z/`. localStorage was captured
both before and after extraction because app activity/window coordination
entries changed while the database records stayed stable. Keep those files
private; they can contain API credentials.

The closed restored Chromium profile is sealed as **`iphone-import-1721`**.
The normal `profile:inspect` command successfully cloned it and confirmed the
same nine stores, 1,823 rows, five localStorage entries and native version 60
at `https://tinybots.net`, with no live Horde connections. Each replay creates
a disposable clone at the production origin:

```sh
npm run profile:run -- iphone-import-1721 --target http://127.0.0.1:3300
```

Use the port serving the build under test. External network access is blocked
by default. This baseline is a **logical import from the iPhone**: it preserves
the recovered records and captured preferences, but does not reproduce the
phone's key-generator high-water marks, cookies/keychain or browser internals.
Physical iPhone restore, upgrade and installed-app lifecycle checks below
remain outstanding. Leave the original installation intact during those tests.

Connect the unlocked phone to the Mac, enable **Settings → Apps → Safari →
Advanced → Web Inspector**, and open ArtBot from its Home Screen icon. Use
Safari's Develop/Apps and Devices inspector to select **ArtBot's Home Screen
app**, rather than an ordinary Safari tab. Home Screen apps have their own
storage. See [Apple's inspection guide](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)
and [Home Screen storage explanation](https://developer.apple.com/videos/play/wwdc2023/10120/?time=521).

This recovery used the Mac's existing trusted pairing over Wi-Fi. Keep VPN off
and the app awake/visible. Reconnection later failed before target discovery
despite valid pairing, a Web Inspector toggle and a Wi-Fi reset; restarting the
iPhone restored access. Resume rechecks saved checkpoint hashes and the source
schema/counts before continuing. The private runbook is
`__local_db/phone-backup/README.md`.

Inspect database names, versions and counts with readonly IndexedDB operations.
Do not load the entire completed store with `getAll()`/`toArray()` just to count
it. Avoid generating more images while taking a consistent backup.

The updated exporter reads **one row per chunk** instead of the library's
2,000-row default and creates compact JSON Blob slices. This reduces serializer
working memory; one unusually large record or the browser's final download can
still exceed a device limit. The 1,700-row browser test checks native read sizes,
row/favorite counts and a 1 MB Blob round trip; it is not a measurement of 1,700
full-resolution images on an iPhone. The legacy deployed exporter does not yet
contain this change. Choose the device extraction method after inspection;
do not assume a desktop code change has backed up the phone.

Copy the backup to the Mac, record its size and SHA-256, and restore it into an
isolated test database. Verify every store's count, image IDs, favorite flags,
source/mask/canvas data and binary hashes. Inspect a few restored images too.
IndexedDB export does not include localStorage: preserve preferences and any
credentials separately and privately. Image-only ZIP downloads do not replace
a full database backup.

For this roughly 980 MB archive, a single-transaction Chromium import failed
with `DataError: Failed to write blobs (InvalidBlob)`. The verified restore used
256 KiB parser chunks and `noTransaction: true` in a fresh disposable database,
then checked every record. This does not validate a large in-place import into
an existing phone library. The production exporter was not changed or deployed
to obtain this recovery.

## Physical-device scenarios

Use a disposable test Home Screen app at one trusted HTTPS origin. Serve the
legacy build there, import a verified copy, then serve the candidate at the
**same origin and path**. Keep its existing icon installed through the update.

- Cold launch, force-quit/reopen and return after a phone restart. Confirm the
  same library, favorites, settings and source images remain.
- Start a multi-image request, lock/background the phone, then resume. Verify
  saved results and pending jobs; check for missing or duplicate submissions.
- Browse every gallery/favorite page, including partial last pages. Switch a
  filter from a later page, favorite/unfavorite, then reopen the app.
- Upload from Photos and Files, use Depth ControlNet and inpainting, and verify
  source/mask persistence after suspension. Exercise touch canvas positioning,
  scrolling, the keyboard and safe-area layout.
- Save/share/download an image and a database export. Confirm files are readable
  outside the app and reimport a copy in the disposable installation.
- Interrupt connectivity while the app is open and verify recovery. Compare
  cold offline launch with the legacy behavior; offline launch is not currently
  promised by this app.
- Update while the test app is open, backgrounded and closed. Check for stale
  chunks, startup errors, unexpected service workers and storage changes.

The current manifest launches `/artbot` in standalone mode. `public/sw.js` is a
placeholder with empty handlers; this checkout does not register it or implement
an offline asset cache. An older installed device can still have historical
worker/cache state, so inspect the device rather than infer it from source.
`e2e/pwa.spec.ts` checks manifest linkage, icon/launch resources and base paths;
it does not install an iPhone app or simulate its storage lifecycle.

## Recoverable backup implementation

The Settings backup, saved-file verification, staged restore and rollback workflow
now shares one type-preserving engine. It includes persistent preferences, byte-
bounded parts, interruption checkpoints, credential opt-ins and restored-request
quarantine. See [Recoverable backups](backup-design.md) for the file format,
repeatable browser tests and the disposable physical Files-test panel.

On 2026-11-11, the engine probe passed in the actual standalone iPhone app using
three synthetic 1 MiB source Blobs. It tested interruption/resume, corrupt-part
rejection, native Blob hashes and rollback, then removed its temporary databases.
It used an in-memory selection adapter and did not open or change the original
phone library. The physical Files handoff and installed-app code-update lifecycle
are separate acceptance checks; the engine probe does not stand in for them.
