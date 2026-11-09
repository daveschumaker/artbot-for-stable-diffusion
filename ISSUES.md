# Known Issues and Upgrade Plan

Last updated: 2026-11-09

Issues marked "Pinned" have a test that documents the bug using `it.failing` or
`test.fail()`. Once a bug is fixed, that test will report a failure until the
marker is removed, so remove it in the same change.

## Suggested order

1. Close the production security holes (S1, S2).
2. Fix the bugs that affect users' libraries and queues (B1, B2).
3. Commit to the Next 15 and React 19 upgrade (U1 to U3).
4. Upgrade the riskier libraries one at a time (U4, U5).
5. Build real batching and the v2 interface (F1, F2).

## Security

- [ ] **S1. Critical: Next.js 14.0.4 has unauthenticated RCE advisories.**
  - Affects the Image Optimization API (AVIF and SVG). The allowed domains in
    `next.config.js` both host user-uploaded files, so treat this as exposed.
  - Fix: upgrade to Next 15.5.28 or later. The 14.2.35 version that `npm audit`
    suggests is still inside the affected ranges.
  - Stopgap: block `/_next/image` at the reverse proxy. The app doesn't import
    `next/image`, so nothing should depend on it.
- [ ] **S2. High: `/api/img-from-url` is an open SSRF.**
  - `pages/api/img-from-url.ts:85` fetches any URL with no login or address check.
  - Pinned: `app/_server-api/apiRoutes.test.ts`
- [ ] **S3. Medium: admin login is weakly protected.**
  - One round of SHA-256 (`app/_server-api/adminTools.ts:52`), no rate limit.
- [ ] **S4. Medium: server messages render unsanitized HTML.**
  - `app/_modules/ServerMessage/serverMessage.tsx:32`
  - `app/_modules/HeaderNav/NotificationDropdown/index.tsx:38`
- [ ] **S5. Medium: Docker setup.**
  - No `.dockerignore`, so `COPY . /artbot` would put `.env` secrets in the image.
  - The image uses end-of-life Node 18.16.
- [ ] **S6. High: other vulnerable dependencies.**
  - `dompurify`, `sharp`, `nodemailer`, `express`, `body-parser`, `fabric`.
  - 37 production advisories at last audit: 5 critical, 17 high.

## Bugs

- [ ] **B1. High: older images crash the image detail page.**
  - Rows with only a `model` string, or with no `source_image`, hit the error
    screen. `db.ts` still handles the `model` shape, so such rows should exist
    in real libraries.
  - Not yet traced. `models[0].indexOf` at
    `app/_data-models/CreateImageRequest.ts:148` is the likely `model` cause.
  - Pinned (`model` case): `e2e/smoke.spec.ts`, `e2e/library.spec.ts`. The
    `source_image` case needs a test.
- [ ] **B2. High: one malformed job blocks the queue until reload.**
  - `app/_api/createImage.ts:41-42` sets `isPending` and then builds params
    outside the `try`.
  - Pinned: `app/_controllers/jobLifecycle.test.ts`
- [ ] **B3. Medium: an undecodable image reports success.**
  - The error is nested in `generations`, so the check at
    `app/_utils/imageCache.ts:522` never sees it. Nothing is saved and the job
    is never marked failed.
  - Pinned: `app/_controllers/jobLifecycle.test.ts`
- [ ] **B4. Medium: outpainting requests leave out the source image.**
  - `=== (InPainting || OutPainting)` at
    `app/_data-models/ImageParamsForApi.ts:289` only ever compares `InPainting`.
  - Pinned: `app/_data-models/ImageParamsForApi.contract.test.ts`
- [ ] **B5. Low: a non-image URL throws in `/api/img-from-url`.**
  - `sizeOf` at `pages/api/img-from-url.ts:109` is unguarded.
  - Pinned: `app/_server-api/apiRoutes.test.ts`
- [ ] **B6. Low: `/api/admin/update-settings` reports success on bad auth.**
  - `pages/api/admin/update-settings.ts:27`. Nothing is written.
  - Pinned: `app/_server-api/apiRoutes.test.ts`
- [ ] **B7. Low: `/api/admin/showcase-publish` hangs on bad auth.**
  - `pages/api/admin/showcase-publish.ts:24` has no response for that path.
  - Pinned: `app/_server-api/apiRoutes.test.ts`
- [ ] **B8. Low: `allPendingJobs(status)` always returns nothing.**
  - `app/_utils/db.ts:193` calls `orderBy` on a collection. Nothing passes a
    status today.
  - Pinned: `app/_utils/db.test.ts`
- [ ] **B9. Medium: the text2img gallery filter shows every image.**
  - Saved rows have no `img2img` field, so `!entry.img2img` at
    `app/_utils/db.ts:298` and `:380` is always true. Both the count and the
    list are affected.
  - Pinned: `app/_utils/db.library.test.ts`
- [ ] **B10. High: "Upscale image" does nothing.**
  - `upscaleImage` at `app/_controllers/imageDetailsCommon.ts:175` passes a
    `DefaultPromptInput`, which has no `jobStatus`, so the job is saved but the
    queue never sends it. Other flows build a `CreateImageRequest` first.
  - Pinned: `e2e/sourceImages.spec.ts`
- [ ] **B11. Medium: `/upscale` shows the changelog.**
  - `app/(default-route-group)/upscale/page.tsx` renders `ChangelogPage`.
  - `app/_pages/UpscalePage/index.tsx` isn't finished: it sends upscalers as
    interrogation forms and only logs the result. Finish it or remove it.

## Upgrades

- [ ] **U1. Next 15.5.29 and React 19, together.** The `app/` directory requires
      React 19 on Next 15. Move to Node 22 or 24 at the same time.
- [ ] **U2. Replace or update libraries without React 19 support.**
  - `react-portal` also uses an API React 19 removed.
  - `react-lazyload` (gallery), `react-select`, `react-swipeable`,
    `react-textarea-autosize`, `react-gallery-carousel`, `react-snap-carousel`,
    `@radix-ui/react-checkbox`, `@radix-ui/react-navigation-menu`,
    `@tabler/icons-react`.
- [ ] **U3. Patch `dompurify`, `sharp` and `nodemailer`.**
- [ ] **U4. Upgrade `fabric` 5 to 7 on its own.** High risk for the canvas code.
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

## Test gaps

- [ ] Backup import and export (`dbImport`, `dbExport`) have no tests.
- [ ] The schema upgrade tests still use hand-built rows. Real rows from
      `e2e/fixtures/library.json` cover queries and the browser, but older rows
      there are derived from new ones. Add a real export from an old library.
- [ ] Add outpainting to the library and UI tests once B4 is fixed.
- [ ] Add a real upscale of an existing image once B10 is fixed.
- [ ] Run the new CI workflow on GitHub. It's unverified on Linux.
- [ ] Refresh `test-utils/hordeApiSchema.json` when the Horde API changes.

## Cleanup

- [ ] Remove the dead `useAllModels` branch: `app/_utils/pendingUtils.ts:194`
      clears the flag that line 262 checks.
- [ ] Track down Jest's "worker failed to exit gracefully" warning.
- [ ] Reduce the 882 `any` and `@ts-ignore` uses.
- [ ] Review the 35 `TODO` and `FIXME` comments in the code.
- [ ] Remove `canvas` from local `node_modules` or reinstall it. It has no
      native binary on Node 24 and nothing needs it.
