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
- Verify the Node 24 interpreter path in ecosystem.config.js exists on the server,
  and Linux sharp/libvips packages are present in the release artifact.
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

## PR contents

Describe the framework upgrades, native-record preservation, staged import and
rollback, paused restored jobs, queue/account/drawing fixes and server limits.
Call out intentional removals (sharing/shortlinks, Showcase, unfinished upscale
page and obsolete SDXL beta UI). Attach the final validation summary and clearly
label physical-device or deployment checks that remain pending. F1 batching,
interface redesign and styled-components removal remain separate work.
