# Upgrade PR validation — 2026-11-11

Application changes are frozen in `11184373`. The final documentation commit is
rebuilt and replayed separately before handoff. Exact source commits, lockfile
and artifact digests, Node/npm versions, Next build IDs and report paths are
recorded in the private `__local_db/pr-candidate-20261111/manifest.json`.
No private profile, export, credential or pairing record belongs in the PR.

## Automated evidence

- 539 Jest tests in 35 suites pass; lint and TypeScript pass. Commit hooks run
  formatting, lint, TypeScript and the complete Jest suite.
- A clean detached checkout installs with `npm ci` and builds successfully using
  Next 16.4.6, React 19.3.1 and Node 24.16.0. Its production server runs on 34770
  with isolated filesystem settings. Validation does not reuse a dev server.
- The native profile harness passes all three checks, including Blob/binary
  fidelity, service workers, cache storage, key-generator history and two
  independent clones. Sealed baseline hashes remain unchanged.
- Both candidate and deployed-source control `1bd51aae` reopen the same populated
  profile twice. All 245 image records, native schemas/versions and stable
  preferences are preserved. Native stores match across the two releases.
- Both lanes complete a ten-image batch through navigation, reload, interrupted
  polling, browser restart, a second tab and primary-tab closure. Each has ten
  acknowledged submissions and ten unique saved results, with one batch parent.
- The deployed Dexie 3 control reopens the candidate's resulting 255-image
  profile. Completed-record bytes and native database versions remain identical.
- Every gallery/filter page matches native IndexedDB in both builds: gallery
  `[50,50,50,50,45]`, favorites `[50,10]`, unfavorited `[50,50,50,35]`.
- Both builds render a 1,000-image library and preserve all original records.
  The extra 957 images are synthetic 512px fixtures, not a phone memory benchmark.
- Direct requests to the compiled local API reject private image URLs, enforce
  the image-import and login rate limits, and accept another client after one
  client reaches its limit. No live Horde requests are made.

The verified 979,780,396-byte phone archive also restores through Settings in
a fresh persistent Chromium profile (55.5 seconds). All nine store counts, 62
favorites, 824 source-image records, 15 masks and 753 historical images without
Horde IDs match; returning to the previous library passes. A separate native
audit of the retained restored database matches all 1,823 original phone-record
fingerprints and binary statistics. This audit uses the private extraction
helper, independently of the new backup codec.

The complete Chromium/Firefox/WebKit matrix is recorded in the private manifest.
Its first pass found four test timing failures: navigation during a thumbnail
fetch, DOM reads during a gallery loading render, and evaluation during the
expected rollback reload. The fixtures now settle before document replacement,
count the same DOM observation they verify, and await library reloads explicitly.
Image contents, metadata, pagination membership and native-record assertions
remain in place. The final run uses the reconciled source and artifact.

A disposable clone of `iphone-import-1721` also passes two application
open/close/reopen cycles. All 1,721 original image records, other stores, native
database versions and stable preferences remain byte-identical; the sealed
baseline hash is unchanged.

## Scope and limits

The control is a local production build of the user-confirmed deployed source,
not the original deployed binary. Browser generation requests use deterministic
fixtures. Interrupted polling starts after POST acknowledgement; this does not
promise exactly-once generation after an ambiguous submission failure.

The verified phone archive contains 1,721 completed images, 100 prompts and two
settings records. A desktop logical restore is separate from physical iPhone
storage, Files interaction and installed-app lifecycle behavior. The original
phone installation and sealed baselines remain intact. Physical Files and installed-PWA update checks remain pending at the user's
request. See [backup acceptance checks](backup-design.md#physical-iphone-checks).

The dependency audit reports one low-severity `deepmerge` advisory in the Jest
tooling chain (seven affected package entries), with no moderate, high or
critical findings. See ISSUES U11. No audit-driven dependency downgrade is applied.

## Release handoff

[The deployment checklist](release-checklist.md) covers the release date,
shortlink environment cleanup, admin scrypt hash rotation, trusted-proxy header
configuration, Linux sharp dependencies, the Node 24 PM2 interpreter, real
upstream route checks and rollback. Those production operations have not run.
The local browser-profile rollback does not establish a production PM2 rollback.

Rebuild and repeat the comparison after further application or dependency changes
and for the exact artifact selected for deployment. Keep the original phone
installation unchanged until its independently verified backup and the physical
acceptance checks are current. Batching, interface redesign and removal of
styled-components remain separate work.
