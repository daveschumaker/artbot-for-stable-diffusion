# iPhone Home Screen regression checks

Desktop WebKit and a Chromium profile snapshot do not validate an installed
Home Screen app on a physical iPhone. Test the installed app and record the
phone model, iOS version, ArtBot build and test origin.

## Protect the existing library first

The existing iPhone library has about 1,700 images and has encountered memory
errors. Its backup and restore have **not** been verified on the device.
Leave that installation and its website data intact until a backup is verified.

Connect the unlocked phone to the Mac, enable **Settings → Apps → Safari →
Advanced → Web Inspector**, and open ArtBot from its Home Screen icon. Use
Safari's Develop/Apps and Devices inspector to select **ArtBot's Home Screen
app**, rather than an ordinary Safari tab. Home Screen apps have their own
storage. See [Apple's inspection guide](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)
and [Home Screen storage explanation](https://developer.apple.com/videos/play/wwdc2023/10120/?time=521).

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
