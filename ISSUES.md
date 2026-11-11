# Known Issues and Upgrade Plan

Last updated: 2026-11-10

Open items only. Finished work is in the git history.

## Suggested order

1. Re-run the production comparison on the final code (R3), then upgrade
   Dexie (U5).
2. Build real batching and the v2 interface (F1, F2).

## Before release

- [ ] **R1. Write a CHANGELOG entry.** The last one is from 2025-08-18. Tell
      users what was removed: shareable links, shortlinks, the `/artbot?i=`
      shared image pages, the community Showcase, "Use all models" and the
      `/upscale` page.
- [ ] **R2. Remove the shortlink env vars from the server.**
      `SHORTLINK_SERVICE` and `NEXT_SHORTLINK_SERVICE` are no longer used.
- [ ] **R3. Re-run the production comparison on the code you release.**
      `docs/upgrade-regression.md` compares the deployed version with this
      branch using a profile captured from production, including rollback and a
      1,000-image library. It has passed, but rerun it after any change to
      the database, queue or image code.
- [ ] **R4. Replace `ADMIN_PW_HASH` with a scrypt hash.** Run
      `node x-build-scripts/hashAdminPassword.js`. The old SHA-256 hash still
      works until then.

## Security

- [ ] **S9. Low: confirm what error reports should contain.** `logError` in
      `app/_utils/appUtils.ts` sends the user's Horde username and full page URL
      to `/api/log-error`, which forwards them with the user agent to
      `STATUS_API`.

## Bugs

None open.

## Dead code

- [ ] **C7. Fix or remove the image page's source image modal.** Opening it is
      commented out in `app/_modules/ImageDetails/index.tsx`, and its "Use for
      inpaint" button only logs to the console.

## Upgrades

- [ ] **U5. Upgrade Dexie last,** only after R3 and with the upgrade tests
      passing.
- [ ] **U10. Remove styled-components** from the 26 files that still use it,
      in favour of Tailwind, then drop `compiler.styledComponents` from
      `next.config.js`. Its maintainers have put it in maintenance mode.
- [ ] **U11. Watch for a fixed `deepmerge`.** It's the only advisory left:
      low severity, in every version from 4.2.0, pulled in by Jest's
      `jest-config`, which Jest 30 still uses. It never ships to users.
- [ ] **U12. TypeScript 6, then 7.** This is on 5.9. TypeScript 6 deprecates
      `baseUrl`, which `tsconfig.json` uses for imports like `app/...` and
      `_types/...`. (Next 16 already switched `moduleResolution` to
      `bundler`.)
      TypeScript 7 is the native compiler, which `ts-jest` doesn't support yet.
- [ ] **U13. Drop the `minimatch` override** in `package.json` once
      typescript-eslint depends on a fixed version (11.0.1 or later) itself.

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

- [ ] The schema upgrade tests still use hand-built rows. Real rows from
      `e2e/fixtures/library.json` cover queries and the browser, but older rows
      there are derived from new ones. Add a real export from an old library.
- [ ] Nothing in the UI sets outpainting yet, so it can only be tested at the
      request level. Add library and UI tests if it gets an entry point.
- [ ] Upscaling is only tested up to the request it sends
      (`e2e/sourceImages.spec.ts`). Add a test that follows the upscaled image
      into the library.
- [ ] The Docker image has never been built.
- [ ] Refresh `test-utils/hordeApiSchema.json` when the Horde API changes.

## Cleanup

- [ ] PNG downloads store their EXIF in a `tEXt` chunk with no keyword,
      instead of the standard `eXIf` chunk. `@asc0910/exif-library` writes it
      this way. Readers that only look for `eXIf` won't find the prompt there,
      though the `parameters` and XMP chunks still carry it.

- [ ] Update the Client-Agent contact in `clientHeader`
      (`app/_utils/appUtils.ts`). `(discord)rockbandit#4910` uses a Discord
      tag format that Discord retired in 2023.
- [ ] Jest's "worker failed to exit gracefully" warning hasn't appeared in
      three full runs since the 30-second timer in
      `app/_server-api/counters.ts` was removed. Close this if it stays gone.
- [ ] Review the React Compiler lint rules. `eslint-plugin-react-hooks` 7
      adds them, and `eslint.config.mjs` turns them off. They report about 85
      existing patterns, mostly `set-state-in-effect` (70 in 55 files). Fix
      them before turning the React Compiler on, or turn individual rules
      back on as code is cleaned up.
- [ ] Reduce the remaining explicit `any` types.
- [ ] Remove the unused exports `npx knip` reports, about 40 exports and
      several exported types. Check each one, since knip doesn't see the
      scripts or the files Jest loads by name. Its unused files and
      dependencies are false positives now.
- [ ] Review the 36 `TODO` and `FIXME` comments in the code.
