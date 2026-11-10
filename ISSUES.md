# Known Issues and Upgrade Plan

Last updated: 2026-11-10

Open items only. Finished work is in the git history.

## Suggested order

1. Fix the remaining security item and bugs (S8, B21, B22).
2. Update the tooling (U6 to U8), then Next 16 (U9).
3. Test against a real production library (R3), then upgrade Dexie (U5).
4. Build real batching and the v2 interface (F1, F2).

## Before release

- [ ] **R1. Write a CHANGELOG entry.** The last one is from 2025-08-18. Tell
      users what was removed: shareable links, shortlinks, the `/artbot?i=`
      shared image pages, the community Showcase, "Use all models" and the
      `/upscale` page.
- [ ] **R2. Remove the shortlink env vars from the server.**
      `SHORTLINK_SERVICE` and `NEXT_SHORTLINK_SERVICE` are no longer used.
- [ ] **R3. Run the branch against a profile captured from production**
      (`docs/browser-profiles.md`) before switching users over.
- [ ] **R4. Replace `ADMIN_PW_HASH` with a scrypt hash.** Run
      `node x-build-scripts/hashAdminPassword.js`. The old SHA-256 hash still
      works until then.

## Security

- [ ] **S8. Moderate: `image-metadata-editor` depends on a vulnerable
      `fast-xml-parser`** (below 5.7.0, GHSA-gh4j-gqv2-49f6). It was last
      published in November 2023. `app/_utils/blobUtils.ts` uses it to write the
      prompt into XMP and PNG text. Replace it, or force a fixed
      `fast-xml-parser` through `overrides`, and check that
      `e2e/download.spec.ts` still passes.
- [ ] **S9. Low: confirm what error reports should contain.** `logError` in
      `app/_utils/appUtils.ts` sends the user's Horde username and full page URL
      to `/api/log-error`, which forwards them with the user agent to
      `STATUS_API`.

## Bugs

- [ ] **B21. Medium, unverified: the feedback form may be dropping
      submissions.** `pages/api/telemetry.ts` posts them to
      `http://localhost:4001/api/v1/artbot/feedback` and always reports
      success. Check on the server whether anything still listens there.
- [ ] **B22. Low: `/api/image-count` redirects to a 404.**
      `pages/api/image-count.ts` sets `Location: /api/status/counter/images`
      without the `/artbot` base path.

## Dead code

- [ ] **C7. Fix or remove the image page's source image modal.** Opening it is
      commented out in `app/_modules/ImageDetails/index.tsx`, and its "Use for
      inpaint" button only logs to the console.

## Upgrades

- [ ] **U5. Upgrade Dexie last,** only after R3 and with the upgrade tests
      passing.
- [ ] **U6. Move to ESLint 9.** ESLint 8.56 stopped getting updates in October
      2024, and `next lint` is deprecated in Next 15.5 and removed in Next 16.
      Switch to the `eslint` command with a flat config, and keep the
      `@typescript-eslint/ban-ts-comment` rule.
- [ ] **U7. Upgrade husky 8 to 9.** `husky install` is deprecated. The
      `prepare` script becomes `husky`.
- [ ] **U8. Upgrade TypeScript 5.3.3.** It also stops `knip` from running,
      which would catch unused files and dependencies automatically.
- [ ] **U9. Upgrade to Next 16** after U6 to U8.
- [ ] **U10. Remove styled-components** from the 26 files that still use it,
      in favour of Tailwind, then drop `compiler.styledComponents` from
      `next.config.js`. Its maintainers have put it in maintenance mode.

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
- [ ] Upscaling is only tested up to the request it sends
      (`e2e/sourceImages.spec.ts`). Add a test that follows the upscaled image
      into the library.
- [ ] The Docker image has never been built.
- [ ] The CI workflow (`.github/workflows/test.yml`) has never run, so it's
      unverified on Linux.
- [ ] Refresh `test-utils/hordeApiSchema.json` when the Horde API changes.

## Cleanup

- [ ] Update the Client-Agent contact in `clientHeader`
      (`app/_utils/appUtils.ts`). `(discord)rockbandit#4910` uses a Discord
      tag format that Discord retired in 2023.
- [ ] Jest's "worker failed to exit gracefully" warning hasn't appeared in
      three full runs since the 30-second timer in
      `app/_server-api/counters.ts` was removed. Close this if it stays gone.
- [ ] Reduce the remaining explicit `any` types.
- [ ] Review the 36 `TODO` and `FIXME` comments in the code.
