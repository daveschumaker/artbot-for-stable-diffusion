# Next 16 validation — 2026-11-10

Validated Next **16.4.6**, React **19.3.1**, Node **24.16.0**, source commit
`38aee4ba` plus the working changes described below. The isolated Turbopack
production build is `202611102001`, Next build ID `2qzXbxbS7qzpx5FwycJxB`, served
on port 3300. The ordinary development server was not used for validation.
The control remains `1bd51aae`, confirmed as the source of the deployed legacy
build `202508182305`, served locally on port 3297.

- **439 Jest tests / 26 suites passed.** TypeScript and lint pass.
- **401 browser tests passed in one final run**, with no failures, skips or
  retries: Chromium 135, Firefox 133, WebKit 133. Runtime was 6.8 minutes.
- The native closed-profile snapshot tests passed, including Blob/binary bytes,
  deleted auto-increment history, CacheStorage, service workers and independent
  restores at the original origin.
- The expanded real production baseline has **245 images and 60 favorites**.
  Both builds display every page: gallery `[50,50,50,50,45]`, favorites `[50,10]`,
  unfavorited `[50,50,50,35]`. Browsing preserves completed-record hashes.
- Native reopen audits match the legacy control: database schemas, record
  hashes and persistent settings. The candidate preserves every original image
  and favorite while adding a ten-image batch, yielding **255 images** after
  reload, interrupted polling, browser restart and primary-tab closure.
- Rollback to the legacy build reopens all **255 images** with identical saved
  image bytes and database versions. The original and expanded sealed baseline
  hashes remain unchanged.
- The final 1,000-image rendering smoke passed in both builds. Its added
  images were synthetic; it is not a full-resolution library benchmark.

The final changes fix a unit test accidentally published as an API route,
create-page observer cleanup, stale pagination offsets when changing filters,
and duplicate queued submissions/completions across tabs. Database export uses
one image row per chunk, has error recovery, and prevents concurrent exports.
New tests cover favorite/unfavorite persistence and partial filtered pages,
tab switching during submission, a 1,700-row export/restore with a 1 MB Blob,
and PWA manifest/launch resources. Existing drawing tests now recheck canvas
coordinates after hover; fixture navigation and queue recovery avoid unrelated
prefetch/network-idle races. A comparison-run directory collision was also fixed.

The new private baseline `production-pagination-favorites` was populated on the
actual legacy site, using real Horde generations. Extra results from the
legacy tab-submission bug were retained. It includes the original workflow
library, three successful dog Depth ControlNet tributes, the uploaded source
photo, favorite flags and worker-error cases. The original JPEG and completed
renders are also saved as separate private keepsakes. No active jobs remained
when it was sealed.

Its profile SHA-256 is
`4f8eebc2264c261b55d4fbe6e4874f9162f4e2cb688a0778e69de2b1fc94d296`.
The original `manual-workflows` baseline remains
`014e4cc0e24a06d1ccb916432c31a51ce79e686019ea5ec3dc92c2d7aa2ec31e`.

Evidence is private under `__local_db/upgrade-comparison/`:

- `next16-validation.json` records the artifact and source/lockfile hashes.
- `e2e-next16-release.json` is the complete 401-case result.
- `results/2026-11-11T04-05-06-986Z-owBhHI/report.json` is the candidate replay.
- `results/rollback-2026-11-11T04-08-01-659Z/report.json` is the 255-image rollback.
- `results/gallery-YBagaz/report.json` checks every real gallery/filter page.
- `results/large-2026-11-11T04-14-23-222Z/report.json` checks the final
  1,000-image rendering scenario in both builds.
- `results/2026-11-11T03-59-31-355Z-dZKOQx/report.json` compares both expanded
  baseline reopen audits. Its candidate build precedes the final pagination
  refinement; the later candidate replay and gallery run use the final build.

Automated Horde requests use deterministic fixtures; they do not establish
external worker reliability. The real capture encountered failed worker jobs,
which remain as error cases. The interrupted-polling test starts after POST
acknowledgment and does not guarantee exactly-once recovery after an ambiguous
submission failure.

**The physical iPhone PWA and its approximately 1,700-image library have not
been backed up or validated.** The user will connect the device later. The
1,700-row test uses small image fixtures and checks bounded native reads, not
actual iPhone memory consumption. Follow [the PWA/device guide](pwa-regression.md)
before attempting extraction or an in-place phone upgrade. No production
deployment or phone storage changes were made.

Use [the regression guide](upgrade-regression.md) to repeat these checks after
further application changes. The interactive review browser uses another
fresh clone of the sealed baseline, with the final build and live Horde access;
its subsequent changes are independent of the validated snapshot.
