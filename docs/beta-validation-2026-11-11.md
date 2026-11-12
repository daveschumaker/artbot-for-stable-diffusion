# Beta validation: 2026-11-11

The deployed beta at `/artbot-beta`, build `202611111801` from `9c312008`,
requires two fixes before it should be considered fully validated. The legacy
control is source commit `1bd51aae`, corresponding to the user-confirmed deployed
build `202508182305`. Tests used Node 26.13.1 and isolated Chromium profile copies;
the three-engine matrix also used Firefox and persistent WebKit where needed.

## Findings and fixes

1. The beta manifest still launched `/artbot`, with production scope, icons and
   shortcuts. Its original browser test failed in all three engines. A generated
   `/manifest.json` route now uses the configured base path while preserving the
   existing manifest URL. Both base paths have route tests.
2. The recovered phone's first saved `promptInput` row contains explicit
   `undefined` values for LoRAs, embeddings and several optional fields. Assigning
   these over form defaults caused `input.loras.forEach` to throw when Create
   opened. This reproduces in legacy and deployed beta. `DefaultPromptInput` now
   retains defaults for undefined fields while preserving defined values such as
   `false`, dimensions, model, seed and prompt. Loading does not rewrite the row.
   A public-loader regression test reproduced the exact exception before the fix;
   a browser regression exercises reopening, creation and saved-image rendering.

Both fixes are in the checkout and in a separately built local beta artifact.
They have **not been deployed** by this validation run.

The legacy 245-image workflow control also stalls on upscale: it writes a pending
row without `jobStatus`, and no Horde submission follows. The control casts a
plain prompt input to `CreateImageRequest`; the candidate already constructs a
real request, which initializes `waiting`. Upscale completed in both candidate
snapshot runs. This is a retained legacy failure, rather than a beta regression.

## Verified coverage

| Check                                                              | Result                                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Complete unit suite after fixes                                    | 542 tests in 37 suites passed                                                                                       |
| Profile-copy/network isolation tests                               | 3 passed                                                                                                            |
| Deployed beta browser matrix                                       | 467 passed, 3 manifest failures, 3 private-archive tests skipped                                                    |
| Saved-input browser regression against deployed beta               | Reproduces the Create failure                                                                                       |
| Fixed local beta production build                                  | Passed                                                                                                              |
| Fixed local beta three-engine matrix                               | 473 passed, 3 private-archive cases skipped; no failures                                                            |
| Original 43-image profile, two reopen cycles                       | Legacy and deployed beta preserve original image/schema bytes                                                       |
| Ten-image batch, navigation, outage, restart and primary-tab close | Both lanes save ten unique results with ten acknowledged submissions                                                |
| Rollback after that batch                                          | All 53 completed records preserved when reopening in legacy                                                         |
| Production pagination/favorites snapshot                           | All five gallery, two favorite and four unfavorited pages pass in both lanes; 245 images and 60 favorites preserved |
| 1,000-image corpus                                                 | Both lanes render gallery/detail and preserve all original records                                                  |
| Recovered 1,721-image profile                                      | Both lanes pass repeated opens with original schema/record bytes preserved                                          |
| Full recovered phone archive through deployed beta Settings        | All 1,823 records restored, including 62 favorites, 824 sources and 15 masks; rollback passed                       |
| 1.03 GiB synthetic binary backup through deployed beta Settings    | Prepare, download, verify, restore, quarantine and rollback passed in 6.6 minutes                                   |
| Expanded edit matrix on fixed candidate                            | 12 checks on each populated snapshot; each saves/renders 13 new outputs; original records preserved                 |

The expanded matrix starts from actual records in both the 245-image production
snapshot and the recovered phone snapshot. It covers tiling text-to-image, a
three-image SDXL batch, reroll, upscale, existing-image img2img, a painted
inpainting mask, Canny and Depth ControlNet, an uploaded PNG, URL import, drawing
canvas to Depth ControlNet, and interrogation. It checks outgoing source/mask
bytes and parameters, saved metadata, completed counts, decoded result images and
original native record fingerprints. This does not enumerate every model,
LoRA/embedding, sampler or parameter combination.

Horde generation and download responses are deterministic fixtures. These runs
validate the app's creation/edit/save protocol and state handling; current live
worker availability and generated-image quality remain separate checks. Private
archives and image bytes stay in disposable browser storage. Sealed baselines,
the original phone installation and the deployed production process are not
modified by these tests.

## Performance

See [the paired performance report](beta-performance-2026-11-11.md) for 72 browser
load samples, direct public HTTP measurements, page weight, CDP memory/task
metrics and ten repeated image open/close cycles per populated library.

The deployed beta is heavier on an empty Create page: median JavaScript transfer
is about 599 KiB versus 514 KiB, and visible prompt readiness is 712 ms versus
405 ms in this controlled desktop run. Populated-gallery readiness is close:
571 ms versus 549 ms for 1,721 images. These compare whole releases, with fixed
service data and preserved profile state; they do not isolate Node's effect or
predict iPhone performance. Memory rises after inspecting images in both builds;
the ten-cycle heap samples oscillate rather than showing a monotonic increase.

## Repeating the checks

Start the read-only deployed-beta relay with the expected build marker:

```sh
node scripts/upgrade-comparison/deployed-beta.mjs --build 202611111801 \
  --port 34861 --out __local_db/upgrade-comparison/my-beta-run
```

The relay copies the test suite into the private output directory and changes
test URLs/selectors to `/artbot-beta`. It forwards unchanged deployed HTML, JS and
CSS; forwards no browser credentials; blocks production paths and writes except
the existing invalid-URL import rejection probes. It preserves Next's RSC and
segment-prefetch headers. Assets are cached by the relay for regression runs,
so use the separate performance runner for timing.

In another terminal, with the isolated legacy control running on 3297:

```sh
node node_modules/@playwright/test/cli.js test \
  -c __local_db/upgrade-comparison/my-beta-run/playwright.config.ts --workers=3
node scripts/upgrade-comparison/compare.mjs \
  --candidate http://127.0.0.1:34861 --candidate-path /artbot-beta
node scripts/upgrade-comparison/gallery.mjs \
  --candidate http://127.0.0.1:34861 --candidate-path /artbot-beta
node scripts/upgrade-comparison/large-library.mjs \
  --candidate http://127.0.0.1:34861 --candidate-path /artbot-beta
node scripts/upgrade-comparison/workflows.mjs \
  --candidate http://127.0.0.1:34861 --lane candidate
node scripts/upgrade-comparison/workflows.mjs \
  --candidate http://127.0.0.1:34861 --lane candidate \
  --baseline iphone-import-1721 --expected-images 1721
```

The phone workflow can reuse a previously verified no-op comparison's original
audit using `--reference-report /private/path/to/report.json`; the runner checks
the baseline name, sealed profile hash and prior lane result first. Original
completed/source records are still audited after the edit scenarios.

Run performance checks separately while other test browsers are closed:

```sh
node scripts/upgrade-comparison/performance.mjs --rounds 3 --beta-build 202611111801 \
  --out __local_db/upgrade-comparison/my-performance-run
node scripts/upgrade-comparison/performance-report.mjs \
  __local_db/upgrade-comparison/my-performance-run/report.json
```

The performance runner pins both public build markers; pass the new expected
`--beta-build` deliberately for the next deployment. Reports, traces and screenshots
are private under `__local_db/upgrade-comparison/`. Physical iPhone Files,
installed-app lifecycle and same-origin code-update acceptance checks remain in
[the PWA checklist](pwa-regression.md).
