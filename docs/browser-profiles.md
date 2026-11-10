# Production-origin browser profiles

Use this workflow to build realistic state on `https://tinybots.net/artbot`,
then run local ArtBot code against a fresh copy of that state. IndexedDB is
never exported or reconstructed: the entire closed Chromium user data directory
is copied, including Blob files, key-generator history, localStorage, caches,
and service-worker registrations.

## Capture a baseline

```sh
npm run profile:capture -- library-v6
```

This opens a **dedicated Chrome for Testing window connected to production**.
Your everyday Chrome profile is untouched. Use ArtBot normally: generate or
import images, save prompts, favorite models, and create the cases you want to
test. Wait for writes to finish. Generation here uses real production services.

In another terminal, finish the capture:

```sh
npm run profile:seal -- library-v6
```

Closing the browser or pressing Ctrl+C in the capture terminal also finishes it.
The capture process shuts down Chromium, waits for it to exit, checks its lock,
copies the profile, hashes every file, and writes a manifest. Wait for
`Saved immutable baseline` before using it. A browser crash or force-killed
capture is not a validated baseline; create a new capture instead.

Choose a new name for each baseline; existing names cannot be overwritten.

To extend a saved library on production, including its existing login and images:

```sh
npm run profile:capture -- production-workflows --from production-library
```

This verifies and copies the old baseline before opening production. Seal the
new name when finished; the original baseline stays unchanged.

## Check the stored data

```sh
npm run profile:list
npm run profile:inspect -- library-v6
```

Inspection launches a **disposable copy**, at the original HTTPS origin, on a
script-free page outside ArtBot's service-worker scope. It does not import the
current application or open databases with a new schema version. External
network requests are blocked.

The JSON report includes native database versions, store/index definitions,
record counts, Blob counts/bytes, binary-value counts, and content hashes. Blob
hashes include MIME type and bytes; record hashes include primary keys and
typed values. Only hashes/counts are printed, not prompts, images or API keys.
Completed/pending tables also include grouped workflow metadata: model,
processing mode, ControlNet type, tiling, post-processing, source/mask presence,
requested dimensions, and decoded output dimensions. This distinguishes an
upscaler being requested from an output actually being larger. Image decode
failures are explicitly reported as `decode-error`.
Batch groups include the shared parent ID, distinct job IDs, requested image
counts, and prompt hashes. Use these to verify that a multi-image request
survived restoration as one group with the expected number of unique images.
The report also lists cache names and service-worker registrations. It does
not hash cached response bodies or measure internal key-generator values.

Hashing reads one record at a time but must buffer each individual Blob for
SHA-256. Large libraries take time; unsupported structured types fail explicitly
instead of silently producing an incomplete hash. An empty database is a valid
new-user case, not a representative existing-user library.

## Replay against local ArtBot

Start the local app in a separate terminal:

```sh
npx next dev --hostname 127.0.0.1 --port 3199
```

Then:

```sh
npm run profile:run -- library-v6 --target http://127.0.0.1:3199
```

The address bar stays at `https://tinybots.net/artbot`. A browser-specific HTTP
CONNECT proxy tunnels only `tinybots.net:443` to a local HTTPS gateway, which
forwards to the selected loopback server. Other browser destinations are denied,
including service-worker traffic. There is no fallback to production. WebSocket
upgrades are forwarded for Next's development server.

The gateway has a locally generated certificate whose public key is accepted
only by the launched test browser. No `/etc/hosts` changes, system CA installation,
global proxy configuration, or root privileges are required. A unique HTTPS
probe verifies the local endpoint, original origin, and secure context before
opening ArtBot. The proxy preserves the original Host and forwarded HTTPS origin.

The CLI prints the disposable run directory. Closing the browser ends the run;
the next invocation starts from another verified copy of the baseline. Run
directories are retained for debugging, never reused automatically.

**Replay network scope:** external browser requests (including AI Horde,
remote images, and model downloads) fail by default. Use application mocks or
local test endpoints for scenarios requiring them. This proxy does not sandbox
Node/Next server-side outbound requests. Configure local server integrations
accordingly before running scenarios that invoke them.

For explicitly live image-generation testing, add `--live-horde`:

```sh
npm run profile:run -- manual-workflows --target http://127.0.0.1:3199 --live-horde
```

This permits HTTPS tunnels to `aihorde.net`, `dev.aihorde.net`, and R2 image
download subdomains of `r2.cloudflarestorage.com`. Your cloned login is used
normally and real jobs spend kudos. `tinybots.net` still serves local code;
other external destinations stay blocked. Inspection always stays offline.
Each run records its target and network mode in `replay.json`.

**Service-worker scenarios:** workers remain enabled and caches are retained.
Old cached code can run first. Verify the visible build/version and the worker
update lifecycle; the HTTPS probe proves routing, not which application build a
worker serves. For release-upgrade tests use `npm run build` followed by
`npx next start --hostname 127.0.0.1 --port 3199` instead of dev/HMR.

## Storage and fidelity

Everything private lives under the already gitignored directory:

```text
__local_db/browser-profiles/
  captures/<name>/profile/      original capture, retained after closing
  baselines/<name>/profile/    immutable baseline: never opened directly
  baselines/<name>/manifest.json
  runs/<name>-<unique>/profile/
  runs/<name>-<unique>/audit.json  for inspection runs
  tls/                        local private key and certificate
```

Keep this directory private: full profiles contain images, prompts, cookies and
credentials. It deliberately sits outside macOS's `Library/Application Support`
so Chromium's ordinary disk cache stays with the custom profile.

All commands accept `--root /absolute/path` if a library needs another disk.
Use the same root when sealing a capture. Remove old _closed_ captures/runs
manually when no longer needed; they can consume substantial disk space.

The manifest records OS, architecture, Chromium executable hash/version, capture
time, original origin, and profile tree hash. Replay rejects modified baselines
or a different browser executable/OS. Both headed and headless operations use
Playwright's full Chromium channel, not a different headless-shell binary.
Keep the matching Playwright package and browser installation for old fixtures.
Cross-version browser upgrades require a separate explicit test workflow.

This preserves persisted state, not process memory, in-flight transactions,
external services or elapsed time. Full browser/OS crash recovery needs a
different capture procedure. Browser cookies/credentials are not guaranteed
portable to a different machine or OS account.

## Verify the harness

```sh
npm run test:profiles
```

The integration test uses real Chromium and a local server. It proves two
independent clones preserve a 2 MB Blob, a nested Blob, typed arrays, dates,
schema/indexes, localStorage, cached response bytes, service-worker execution,
and the next ID after inserting then deleting a high ID. It also verifies local
origin routing, blocked external requests, live-profile refusal, baseline
immutability, overwrite refusal and browser-version mismatch refusal.

Prerequisites: macOS or Linux, installed npm dependencies, the matching Playwright Chromium
(`npx playwright install chromium` if missing), and `openssl` on PATH.
