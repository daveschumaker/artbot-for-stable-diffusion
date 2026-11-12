# On-demand Create features: 2026-11-11

This pass reduces the Create page's initial JavaScript while preserving preset,
model, creation, editing, and backup workflows. The control is commit `9e4ed15b`,
beta build `202611111940`; the candidate is that source plus this change, locally
built as `202611112007`. Both use Node 26.13.1, Next 16.4.6, React 19.3.1 and
`BASE_PATH=/artbot-beta`. These results describe local production builds.

## Changes

- Load the preset dropdown and catalog when opened. Preset links load the same
  catalog during their asynchronous input initialization, before applying input.
- Load LoRA search/favorite/recent dialogs and embedding search/favorite/recent
  dialogs when mounted inside an open modal. Show a loading status while fetching.
- Load the model details dialog when its button is clicked.
- Check the small preference-transition journal at startup. When present, load
  the existing backup manager and await its cross-tab recovery fence before
  rendering the app. Recovery failures retain the existing blocked/retry screen.
- Load the backup engine inside the existing asynchronous database import/export
  entry points. This removes a second eager import through shared DB utilities.

Fabric and Dexie export/import were already deferred. No cache replacement or
additional splitting of controls needed immediately on Create is included.

## Bundle and browser measurements

The Next Turbopack analyzer identifies Create's bootstrap and render-dependent
static groups. JavaScript source contributions in those groups fell from
**1,655,696 to 1,397,022 bytes**, a **258,674-byte (15.6%) reduction**. CSS
contributions remain 275,773 bytes; the combined JS/CSS reduction is 13.4%.
These are minified, uncompressed contributions, not gzip transfer savings. The
catalog, backup manager/parser, and hidden dialog implementations are absent from the initial
JavaScript graph; lightweight storage helpers remain available for startup.
Backup deferral also removes eager stream/buffer compatibility dependencies.

Three paired Chromium rounds used disposable copies of the same sealed new-user
profile, deterministic eight-model service fixtures, identical viewports, and
alternating lane order. Native HTTP cache was cleared for each first navigation,
then a reload measured warm caching. Profiling ran separately from tests/builds.

| Create metric, median                             |      Before |       After |
| ------------------------------------------------- | ----------: | ----------: |
| Cold JS transferred, including headers/prefetches |   599.4 KiB |   537.9 KiB |
| Cold decoded JS                                   | 1,918.1 KiB | 1,665.6 KiB |
| Cold prompt visible                               |      567 ms |      552 ms |
| Warm prompt visible                               |      214 ms |      205 ms |
| Cold FCP                                          |       96 ms |       96 ms |
| Cold LCP                                          |      508 ms |      512 ms |
| Cold JS heap after GC                             |     9.2 MiB |     8.9 MiB |
| Warm JS heap after GC                             |     9.0 MiB |     8.6 MiB |

The clear result is **10.3% less transferred JavaScript**. Timing differences are
small lab observations, not evidence of a meaningful speedup. Both local servers
have the same runtime; loopback TTFB does not characterize public hosting. This
is not an iPhone measurement. JS heap excludes native image/Blob memory.

Raw analyzer data, source contribution lists, HTTP/resource timings, CDP heap
samples and separate traces are private under
`__local_db/code-splitting-20261111/`. The profile copies are disposable; the sealed
baseline hashes were verified unchanged after profiling.

The profiler now accepts paired local artifact origins. Both must be loopback
URLs and serve `/artbot-beta`; existing public profiling behavior is unchanged.
Its historical `legacy` lane labels the before artifact in this mode:

```sh
node scripts/upgrade-comparison/performance.mjs \
  --legacy-origin http://127.0.0.1:34864 \
  --beta-origin http://127.0.0.1:34865 \
  --legacy-build 202611111940 --beta-build 202611112007 \
  --quick --rounds 3 --out __local_db/code-splitting-20261111/performance
```

Run with Node 26 and explicitly started, isolated production artifacts. Omit
`--quick` to include drawing, settings, galleries, and image-open memory cycles.
`performance-report.mjs` distinguishes local HTTP from public TLS measurements.

## Validation

- Production build, TypeScript and changed-file ESLint checks passed.
- **542 unit tests in 37 suites passed.**
- **473 existing browser checks passed** across Chromium, Firefox and WebKit.
- **9 new optional-feature browser checks passed** in a separate final run across
  the same three engines. The first matrix run used an ambiguous preset selector;
  the corrected test selects the exact preset row and awaits the initial input
  before editing. Only the test changed after the measured application build.
- Three private full-phone-archive import cases were skipped because the archive
  environment variable was not supplied. Other backup/import/recovery tests ran.
- **12 snapshot workflows passed on each of the 245-image and 1,721-image
  libraries.** Each run saved/rendered 13 new images and preserved all original
  record fingerprints. This includes tiling, multi-image SDXL, reroll, upscale,
  img2img, inpainting, Canny/Depth ControlNet, upload, URL import and drawing.

Raw browser reports are `validation/e2e.json` and
`optional-validation/e2e.json` beneath the private evidence directory above.
The finalized existing and new test sets are combined in `validation-summary.json`;
the original matrix report retains the superseded test failures. Snapshot reports
are `__local_db/upgrade-comparison/results/workflows-cojWeB/report.json` (245) and
`workflows-sBlLDP/report.json` (1,721). No physical iPhone check was run in this pass.

The new browser regressions cover selecting a preset, opening a preset link,
creating with its model/LoRA/dimensions/parameters, and opening/closing/reopening
model details and saved LoRA/embedding dialogs. Existing tests exercise CivitAI
search, source images, drawing, inpainting, ControlNet, compatibility backups,
multipart recovery, rollback, and startup preference repair.
