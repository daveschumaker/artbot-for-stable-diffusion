# Upgrade PR and release checklist

This branch updates ArtBot to Next 16, React 19, Dexie 4 and Fabric 7, and adds
recoverable backups and generation recovery. Existing libraries remain on the
same imageHorde schema version. Real libraries and sealed test baselines must
remain untouched by validation; use disposable profile clones.

## Candidate validation

- Run Jest, lint and TypeScript, then build an isolated production artifact.
- Record the exact source commit, lockfile digest, Node version, build marker and
  artifact identity in the private release-validation manifest.
- Follow [the production comparison guide](upgrade-regression.md): reopen the
  populated baseline, exercise a ten-image queue through reload/restart/tab
  changes, compare every gallery/filter page, test the larger library and reopen
  the resulting candidate profile with the deployed Dexie 3 control.
- Verify sealed baseline hashes before and after. Keep private profiles, exports,
  credentials, manifests with private paths and screenshots out of Git.
- Run the [backup regression commands](backup-design.md#repeatable-verification),
  including interruption recovery, native localStorage quota and Blob fidelity.
- Require the Linux `docker` CI job to pass. It builds from the Docker context
  without host `build_info.json`, exercises native sharp, starts the image and
  compares `/artbot/api/server-info` with the metadata generated inside it.
- Complete the [physical device matrix](backup-design.md#physical-iphone-checks)
  on a disposable HTTPS installation with a distinct origin. Preserve the original
  Home Screen app. Desktop WebKit and the injected synthetic engine probe do not
  establish installed-app upgrade acceptance.

## Deployment preparation

- Confirm an independently verified, current backup exists for the original
  phone installation before any production migration.
- Date CHANGELOG.md for the actual release; keep each heading date unique.
- Remove obsolete SHORTLINK_SERVICE / NEXT_SHORTLINK_SERVICE server variables.
- Rotate ADMIN_PW_HASH to a scrypt hash using x-build-scripts/hashAdminPassword.js.
  Keep the secret out of logs, PRs and version control.
- Verify nginx appends the connection address using
  `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`.
  The application accepts that last hop only from a loopback proxy connection;
  direct external connections use their socket address. X-Real-IP is ignored.
- Login failure limits are per client: five failures in 15 minutes. There is no
  global lockout. Limits are process-local; review them if adding server workers.
- URL image imports allow 30 requests/minute/client, two active requests/process,
  10 MB encoded input, an 8,192-pixel side and at most 64 million input pixels.
  Limits include the R2/full-size path. Generation downloads go directly to R2.
- Install the pinned Node 26.13.1 LTS runtime and verify the exact interpreter
  path in ecosystem.config.js exists on the server. Confirm npm is at least
  11.20.0 and Linux sharp/libvips packages are present in the release artifact.
- Keep the old release and its original ecosystem.config.js. Replace only the
  ArtBot PM2 process using the documented stop/start scripts; verify the new
  interpreter and save PM2 state. Other applications retain their current Node.
- Check beta tarball naming and the selected upload artifact before using the
  private release scripts; ISSUES R8 remains open.

## Deployment verification and rollback

Request server-info, models/available, models/details, models/updates,
horde-performance and worker-details against the deployed release. Browser e2e
fixtures mock these handlers and do not establish real upstream connectivity.
Check a normal page load and an existing library before expanding rollout.

If rollback is required, delete only the horde-js PM2 process, start the retained
old release with its original ecosystem.config.js and save PM2 state. Verify the
old build and image library. Do not delete browser storage or backup catalogs.
Keep the candidate and recovery artifacts for diagnosis.

### Downgrading after a staged library restore

The deployed legacy build (`1bd51aae`, Dexie 3) always opens `imageHorde`.
The new build can instead select an audited `artbot-restored-*` database using
`ArtBotLibrarySelection`. Legacy code does not read that selection or the backup
catalog. A code downgrade therefore shows the original `imageHorde` library;
it does not merge or display images saved in a selected restored library.
Those restored records remain in browser storage. An older-looking gallery
after downgrade is not evidence that the restored database was deleted.

Choose the recovery path before switching server code:

1. Keep the candidate available, stop new submissions and let active jobs settle.
   Close other ArtBot windows, including legacy windows, during the handoff.
   Confirm there are no runnable pending requests before exporting for legacy
   import. Legacy code does not honor restored-request quarantine; importing
   pending requests there can submit them again and spend credits twice. If jobs
   cannot be settled, retain the candidate and its profile to finish recovery.
2. In the selected library, prepare a multipart backup, save every part and its
   manifest outside browser storage, and verify those saved copies. Preserve
   preferences separately for the legacy handoff: compatibility JSON includes
   database records, not localStorage settings or credentials. Keep backups and
   any credentials private. For desktop validation, retain a fully closed copy
   of the browser profile as well.
3. To return to the original library, use **Return to previous library** while
   the candidate is still available, then verify that the intended images and
   favorites are present. This switches selection; it does not copy newer images
   back. After multiple restores, the previous library may itself be another
   restored database. Confirm the active database is `imageHorde` before assuming
   that legacy code will show the same library. The desktop Inspector expression
   `window._artbotDb.name` reads its identity without changing it.
4. If the restored library's newer contents must be usable in legacy code,
   export them **before** switching back: Settings → Import / Export → **Legacy
   compatibility JSON export** → **Download database**. Save the actual file
   outside browser storage. Its database header is `imageHorde`, even when its
   source was a selected restored database. It is one large file and can exceed
   mobile memory limits; a multipart backup cannot be imported by legacy code.
   If compatibility export fails, keep the multipart backup and candidate
   profile and finish the handoff on a suitable desktop before downgrading.
5. Verify that saved JSON using the retained legacy build in a **fresh disposable
   browser profile**, with external generation requests blocked. Import through
   its Settings page, reopen the app, and compare all store counts, image IDs,
   favorites, source/mask/canvas values and Blob/binary bytes with the exported
   source. Confirm representative images render. The legacy importer does not
   safely replace a populated database; do not test it over the original library.
6. Retain both profiles and all saved backups through the code rollback. A
   verified legacy import in a fresh profile provides access to the newer
   contents there; it does not update the original installation automatically.
   If the same installed app must display those newer contents, postpone the
   downgrade until that migration is independently verified. Do not clear website
   data, delete or rename databases, or edit selection/catalog records to force it.

The 255-image rollback regression verifies reopening the canonical `imageHorde`
library with unchanged bytes and native database versions. It does not establish
legacy support for selected restored libraries, preference recovery, pending-job
quarantine or a physical Home Screen installation. Keep the original phone app
intact; its Files and installed-app acceptance checks remain separate.

A disposable desktop rehearsal on 2026-11-11 checked both paths using candidate
`02b7b472` and the actual legacy build `1bd51aae`. The same-profile code downgrade
displayed the one original canonical image and retained the separate four-image
restored database byte-for-byte. Its saved compatibility JSON then imported
through legacy Settings in a fresh profile. All nine store schemas, native
versions, counts and record digests matched, including source/mask/canvas data,
a nested Blob and typed binary; the post-restore image rendered after reopen.
These synthetic fixtures establish the desktop handoff, not mobile export-memory
or physical installed-app acceptance.

## PR contents

Describe the framework upgrades, native-record preservation, staged import and
rollback, paused restored jobs, queue/account/drawing fixes and server limits.
Call out intentional removals (sharing/shortlinks, Showcase, unfinished upscale
page and obsolete SDXL beta UI). Attach the final validation summary and clearly
label physical-device or deployment checks that remain pending. F1 batching,
interface redesign and styled-components removal remain separate work.
