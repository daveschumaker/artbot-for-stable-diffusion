# Known Issues and Upgrade Plan

Last updated: 2026-11-11

Open items only. Finished work is in the git history.

## Suggested order

1. Land the upgrade branch first. F1 (batching) is on hold until then.
2. Remove styled-components (U10), then match the v2 interface (F2).

## Before release

- [ ] **R1. Date the CHANGELOG entry.** The upgrade entry at the top of
      `CHANGELOG.md` is dated 2026.11.11. Change the heading to the release
      date. Each date must appear only once, since it's the entry's link.
- [ ] **R2. Remove the shortlink env vars from the server.**
      `SHORTLINK_SERVICE` and `NEXT_SHORTLINK_SERVICE` are no longer used.
- [ ] **R4. Replace `ADMIN_PW_HASH` with a scrypt hash.** Run
      `node x-build-scripts/hashAdminPassword.js`. The old SHA-256 hash still
      works until then.
- [ ] **R5. Run ArtBot on Node 24 under PM2.** Next 16, sharp and
      isomorphic-dompurify need Node 20.19.5 or later, and `next start` exits
      at once on the server's Node 18. Production's other apps stay on 18.
  - Install exactly the version `ecosystem.config.js` names
    (`/root/.nvm/versions/node/v24.22.2/bin/node`), and check that path
    exists. A different patch version breaks the path.
  - The PM2 apps were set up with `script: 'npm'`. `pm2 restart` keeps that,
    so run `npm run pm2:stop-prod`, then `npm run pm2:start-prod`, then
    `pm2 save`. Check `pm2 describe horde-js` shows the v24 interpreter.
  - Never run `npm run start` on the server: it uses the default Node 18.
  - Check the release tarball has `node_modules/@img/sharp-linux-x64` and the
    Linux libvips package.
- [ ] **R6. Write down and try the rollback.** Keep the previous release
      directory and its `ecosystem.config.js` (`script: 'npm'`, Node 18).
      Rolling back means `pm2 delete horde-js`, starting the old one, and
      `pm2 save`.
- [ ] **R7. Check the real API routes after deploying.** The e2e tests mock
      every `/artbot/api/*` request in the browser, so these handlers never
      run for real in tests: `server-info`, `models/available`,
      `models/details`, `models/updates`, `horde-performance` and
      `worker-details`. Request each one once the release is up.
- [ ] **R8. Beta releases.** The gitignored `x-build-scripts/release.sh`
      always uploads `artbot.tar.gz`, while `build.sh` names the beta build
      `artbot-beta.tar.gz`, so a beta release uploads the production build.
      `/root/artbot-beta/data` must exist. Beta's feedback form posts to the
      same hard-coded feedback service as production
      (`pages/api/telemetry.ts`).

## Security

- [ ] **S9. Low: confirm what error reports should contain.** `logError` in
      `app/_utils/appUtils.ts` sends the user's Horde username and full page URL
      to `/api/log-error`, which forwards them with the user agent to
      `STATUS_API`.

## Dead code

- [ ] **C7. Fix or remove the image page's source image modal.** Opening it is
      commented out in `app/_modules/ImageDetails/index.tsx`, and its "Use for
      inpaint" button only logs to the console.
- [ ] **C8. Retire the V1 header.** `app/_modules/HeaderNav`, including
      `HordeDropdown`, is only rendered by `pages/404.tsx`. Every other page
      uses `app/_componentsV2/HeaderNav`. Give the 404 page the V2 header,
      then delete the V1 one and its tests.

## Upgrades

- [ ] **U10. Remove styled-components** from the 15 files that still use it,
      in favour of Tailwind, then drop `compiler.styledComponents` from
      `next.config.js`. Its maintainers have put it in maintenance mode.
- [ ] **U11. Watch for a fixed `deepmerge`.** It's the only advisory left:
      low severity, in every version from 4.2.0, pulled in by Jest's
      `jest-config`, which Jest 30 still uses. It never ships to users.
- [ ] **U12. TypeScript 7.** This is on TypeScript 6.0.3. TypeScript 7 is
      the native compiler, which typescript-eslint (8.72 supports up to 6.0)
      and `ts-jest` (up to 6.x) don't support yet.
- [ ] **U13. Drop the `minimatch` override** in `package.json` once
      typescript-eslint's `typescript-estree` depends on a fixed version
      itself. The override forces `^11.0.7` where it asks for `^10.2.2`, a
      major version apart. Lint passes with it.

## Features

- [ ] **F1. Real batching.** On hold until the upgrade branch lands.
  - Today v1 sends `n: 1` (`app/_data-models/ImageParamsForApi.ts:168`), and
    `app/_utils/pendingUtils.ts` makes one pending row per image (up to
    `MAX_IMAGES_PER_JOB`, 200). The Horde accepts up to 20 images per request.
  - `checkCurrentJob` in `app/_utils/imageCache.ts` treats a second generation
    as an SDXL_beta companion and returns after it, so a job keeps at most two
    images. `jobLifecycle.test.ts` documents this.
  - **How v2 (`artbot-haidra`) does it.** It uses a separate database with
    different tables:
    - `imageRequests` holds the settings.
    - `hordeJobs` has one row per Horde request, with `images_requested`,
      `images_completed` and `images_failed`.
    - `imageFiles` has one row per image, keyed by the Horde generation id.
    - Favourites have their own table.
  - When a v2 job finishes, it reads the status once and downloads every
    generation. Then, in one write transaction, it skips images already
    saved, adds the new ones and updates the counts. Censored or failed images
    count as failed. Each job has its own queue, so two downloads of the same
    job can't overlap.
  - **v1 probably doesn't need a schema change.** v1 already stores one
    completed row per image, grouped by `parentJobId`. A pending row could
    stand for one Horde request of up to 20 images, using the existing
    `numImages` field. Each completed image would then need its own `jobId`,
    for example the generation id. Image pages look images up by `jobId`, and
    `addCompletedJobToDexie` skips a `jobId` it has already saved, so
    reusing the Horde job id would drop every image after the first. Using
    existing fields and indexes means no new `db.version()`, which keeps
    rollback safe (see `docs/upgrade-regression.md`).
  - **Rollback risk.** Completed rows stay readable by the deployed site. A
    pending batch that is still running during a rollback would be treated
    as a single image, so it would keep at most two images. That only
    affects jobs running at that moment.
  - **What has to change:**
    - Split each request into chunks of up to 20 per model.
    - Save every generation in `checkCurrentJob` and give up the SDXL_beta
      special case.
    - The pending page's progress and the cancel and retry actions.
    - Splitting kudos per image.
    - The duplicate check in `addCompletedJobToDexie`.
  - `origin/feat-batch` is unfinished work from March 2024. Use it for ideas.
- [ ] **F2. Match the v2 interface.**
- [ ] **F3. Upscale any uploaded image.**
  - Neither v1 nor v2 can do this today. Send upscalers as Horde alchemy forms
    through `/api/v2/interrogate/async`, then poll for the result and show or
    save the output.

## Test gaps

- [ ] The schema upgrade tests still use hand-built rows. Real rows from
      `e2e/fixtures/library.json` cover queries and the browser, but older rows
      there are derived from new ones. Add a real export from an old library.
- [ ] Nothing in the UI sets outpainting yet, so it can only be tested at the
      request level. Add library and UI tests if it gets an entry point.
- [ ] Upscaling is only tested up to the request it sends
      (`e2e/sourceImages.spec.ts`). Add a test that follows the upscaled image
      into the library.
- [ ] The bulk zip export (`downloadImages`) has no test.
- [ ] The inpainting mask canvas, and loading fabric 5 `canvasData` saved by
      older versions, have no tests.
- [ ] Several e2e tests wait a fixed time: `civitaiSearch.spec.ts` (the
      stale-search test), `queueMultiTab.spec.ts`, `settings.spec.ts`,
      `security.spec.ts` and `sourceImages.spec.ts`. Wait for the event
      instead.
- [ ] Playwright reuses whatever answers on its port, which can be a dev
      server instead of a production build.
- [ ] Confirm a passing Linux Docker CI run. The image now uses `npm run build`
      to generate fresh build metadata. CI builds the image, exercises sharp,
      starts the production server and checks its reported build ID. A local
      Node build does not establish that the Linux container passes.
- [ ] Refresh `test-utils/hordeApiSchema.json` when the Horde API changes.

## Cleanup

- [ ] PNG downloads store their EXIF in a `tEXt` chunk with no keyword,
      instead of the standard `eXIf` chunk. `@asc0910/exif-library` writes it
      this way. Readers that only look for `eXIf` won't find the prompt there,
      though the `parameters` and XMP chunks still carry it.
- [ ] Jest's "worker failed to exit gracefully" warning hasn't appeared in
      three full runs since the 30-second timer in
      `app/_server-api/counters.ts` was removed. Close this if it stays gone.
- [ ] Review the React Compiler lint rules. `eslint-plugin-react-hooks` 7
      adds them, and `eslint.config.mjs` turns them all off. Turned on, they
      report `set-state-in-effect` 57 times, `preserve-manual-memoization` 8,
      `refs` 3 and `purity` 2. The others report nothing and could be turned
      back on now.
- [ ] Lint warnings never block a commit. Add `--max-warnings=0` to the lint
      script and lint-staged.
- [ ] `.husky/post-merge` runs `npm install`, which can rewrite
      `package-lock.json`, and nothing reinstalls after `pull --rebase` or
      switching branches. Use `npm ci`, and add `post-checkout`.
- [ ] `.github/workflows/test.yml` is left from an early commit. Delete it if
      it isn't wanted.
- [ ] Reduce the remaining explicit `any` types.
- [ ] Review the 26 `TODO` and `FIXME` comments in the code.
