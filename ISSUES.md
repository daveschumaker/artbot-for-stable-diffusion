# Known Issues and Upgrade Plan

Last updated: 2026-11-09

Issues marked "Pinned" have a test that documents the bug using `it.failing` or
`test.fail()`. Once a bug is fixed, that test will report a failure until the
marker is removed, so remove it in the same change.

## Suggested order

1. Fix the remaining bugs (B3, B4, B6 to B9, B11) and security items (S3 to S6).
2. Patch the remaining dependencies (U3).
3. Upgrade the riskier libraries one at a time (U4, U5).
4. Build real batching and the v2 interface (F1, F2).

## Security

- [x] **S1. Critical: Next.js RCE advisories.** Fixed by upgrading to Next
      15.5.29. `middleware.ts` still returns 404 for `/_next/image`, because
      the app doesn't use it.
- [x] **S2. High: `/api/img-from-url` was an open SSRF.** Fixed by
      `app/_server-api/fetchRemoteImage.ts`, which checks addresses when
      connecting and on every redirect, and caps download size.
- [x] **S3. Medium: admin login was weakly protected.** Added scrypt hashes and
      rate limiting. Run `node x-build-scripts/hashAdminPassword.js` and replace
      `ADMIN_PW_HASH` to stop using the old SHA-256 hash.
- [x] **S4. Medium: server messages rendered unsanitized HTML.** Fixed.
- [x] **S5. Medium: Docker could bake in `.env` secrets.** Added `.dockerignore`.
      The image now builds the app itself. Not yet built with Docker.
- [x] **S6. High: other vulnerable dependencies.** Removed, patched or upgraded.
      0 critical and 0 high production advisories remain, and 7 moderate or low.

## Bugs

- [x] **B1. High: older images crashed the image detail page.** Fixed by a read
      hook in `app/_db/dexie.ts` that fills in `models` and `source_image`.
- [x] **B2. High: one malformed job blocked the queue until reload.** Fixed in
      `app/_api/createImage.ts`. The job is now marked as failed.
- [x] **B3. Medium: an undecodable image reported success.** The job is now
      marked as failed.
- [x] **B4. Medium: outpainting requests left out the source image.** Fixed in
      `app/_data-models/ImageParamsForApi.ts`.
- [x] **B5. Low: a non-image URL threw in `/api/img-from-url`.** Fixed with S2.
- [x] **B6. Low: `/api/admin/update-settings` reported success on bad auth.**
      It now returns 401.
- [x] **B7. Low: `/api/admin/showcase-publish` hung on bad auth.** It now
      returns 401.
- [x] **B8. Low: `allPendingJobs(status)` always returned nothing.** Fixed in
      `app/_utils/db.ts`.
- [x] **B9. Medium: the text2img gallery filter showed every image.** Fixed in
      `app/_utils/db.ts`.
- [x] **B10. High: "Upscale image" did nothing.** Fixed in
      `app/_controllers/imageDetailsCommon.ts`.
- [x] **B11. Medium: `/upscale` showed the changelog.** Removed the route and the
      unfinished page. "Upscale image" in the image menu still works.

- [ ] **B12. Medium: drawings can't be sent to img2img or ControlNet.**
  - "Use for img2img" in `app/_modules/Editor/components/toolbar.tsx` routes to
    `/?drawing=true`, which is now the home page. It should be `/create`.
  - On `/controlnet?drawing=true`, the initial input effect in
    `app/_pages/ControlNetPage/index.tsx` wipes the imported drawing.
  - Pinned: `e2e/canvas.spec.ts`
- [ ] **B13. Medium: "New canvas" leaves a broken canvas.**
  - `handleNewCanvas` in `app/_modules/Editor/editor.tsx` clears the saved
    drawing state but not `drawLayer`, so stale data is restored over it.
  - Pinned: `e2e/canvas.spec.ts`

## Upgrades

- [x] **U1. Next 15.5.29 and React 19.3.1.**
- [x] **U2. Libraries moved to React 19 compatible versions.** `react-lazyload`
      and `react-gallery-carousel` are unmaintained and run through `overrides`.
- [x] **U3. Patched `dompurify`, `sharp` and `nodemailer`.** Needs Node 20.19.5
      or later.
- [x] **U4. Upgraded `fabric` 5 to 7.4.0.** Removed the unreachable
      `PainterCanvas`, `PainterPanel` and `Editor/controller.ts`.
- [ ] **U5. Upgrade Dexie last,** only with the upgrade tests passing.

## Features

- [ ] **F1. Real batching.**
  - `n` is hardcoded to 1 (`app/_data-models/ImageParamsForApi.ts:168`) and
    `app/_utils/pendingUtils.ts` queues one job per image. The Horde accepts up
    to 20.
  - `checkCurrentJob` keeps only the first two images a job returns, so this
    must change first. A test in `jobLifecycle.test.ts` documents it.
  - `origin/feat-batch` is unfinished work from March 2024. Use it for ideas.
- [ ] **F2. Match the v2 interface.**
- [ ] **F3. Upscale any uploaded image.**
  - Neither v1 nor v2 can do this today. Send upscalers as Horde alchemy forms
    through `/api/v2/interrogate/async`, then poll for the result and show or
    save the output.

## Test gaps

- [ ] Backup import and export (`dbImport`, `dbExport`) have no tests.
- [ ] The schema upgrade tests still use hand-built rows. Real rows from
      `e2e/fixtures/library.json` cover queries and the browser, but older rows
      there are derived from new ones. Add a real export from an old library.
- [ ] Nothing in the UI sets outpainting yet, so it can only be tested at the
      request level. Add library and UI tests if it gets an entry point.
- [ ] Add a real upscale of an existing image once B10 is fixed.
- [ ] Run the new CI workflow on GitHub. It's unverified on Linux.
- [ ] Refresh `test-utils/hordeApiSchema.json` when the Horde API changes.

## Cleanup

- [ ] `CreateCanvas.getMaskForInput` never resolves when there's no saved mask, so
      the rest of `uploadInpaint` doesn't run on that path. Decide what it should do.
- [ ] Remove `AbTestModal` and `react-gallery-carousel`. The carousel relies on
      `defaultProps`, which React 19 ignores on function components, and the
      modal is only reachable for the retired `SDXL_beta` model.
- [ ] Replace `react-lazyload`, which is unmaintained.
- [ ] Remove the dead `useAllModels` branch: `app/_utils/pendingUtils.ts:194`
      clears the flag that line 262 checks.
- [ ] Track down Jest's "worker failed to exit gracefully" warning.
- [ ] Reduce the 882 `any` and `@ts-ignore` uses.
- [ ] Review the 35 `TODO` and `FIXME` comments in the code.
