import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const report = JSON.parse(await readFile(process.argv[2], 'utf8'))
assert.equal(report.status, 'passed', 'Only summarize a completed run')
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}
const metric = (samples, getter) => median(samples.map(getter))
const number = (n) => Number(n.toFixed(1))
const mib = (n) => number(n / 1048576)
const kib = (n) => Math.round(n / 1024)
const assets = (sample, suffix, field) =>
  sample.resources
    .filter((r) => r.path.endsWith(suffix))
    .reduce((sum, r) => sum + r[field], 0)
const scenarios = [...new Set(report.samples.map((s) => s.scenario))]
const samples = (scenario, lane, cache) =>
  report.samples.filter(
    (s) => s.scenario === scenario && s.lane === lane && s.cache === cache
  )
const lines = [
  '# Legacy and beta performance comparison',
  '',
  `Legacy build **${report.builds.legacy}**; beta build **${report.builds.beta}**.`,
  `${report.rounds} paired rounds, Chromium ${report.browser}, ${report.viewport.width} × ${report.viewport.height}, no CPU/network throttling.`,
  '',
  `The same sealed profiles are copied for both lanes. HTTP cache is cleared before the first load; a repeat load uses the native browser cache. Other persisted profile state, including browser code caches, is retained. Fixed service fixtures isolate application assets and browser work from live Horde/model API latency. Response bodies are unchanged. ${
    report.localArtifacts
      ? 'Both lanes use local production artifacts; legacy labels the before artifact and beta labels the candidate. Direct HTTP measurements use new loopback connections.'
      : 'Browser traffic passes through a local read-only relay. Direct HTTP measurements include a new TLS connection.'
  }`,
  '',
  'These are desktop lab medians, not field percentiles or iPhone results. They compare two whole releases and do not isolate the effect of Node alone.',
  '',
  '## Time to usable UI',
  '',
  'Create is ready when the prompt field is visible; drawing when its canvas is visible; a populated gallery when its first image is decoded. Measurements include navigation and framework startup. Models use the same eight fixture entries in both lanes.',
  '',
  '| Scenario | Cache | Legacy ready ms | Beta ready ms | Change | Legacy FCP ms | Beta FCP ms | Legacy LCP ms | Beta LCP ms |',
  '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
]
for (const scenario of scenarios)
  for (const cache of ['cold', 'warm']) {
    const old = samples(scenario, 'legacy', cache),
      beta = samples(scenario, 'beta', cache)
    const a = metric(old, (s) => s.usableMs),
      b = metric(beta, (s) => s.usableMs)
    lines.push(
      `| ${scenario} | ${cache} | ${Math.round(a)} | ${Math.round(
        b
      )} | ${number((b / a - 1) * 100)}% | ${Math.round(
        metric(old, (s) => s.fcpMs)
      )} | ${Math.round(metric(beta, (s) => s.fcpMs))} | ${Math.round(
        metric(old, (s) => s.lcp)
      )} | ${Math.round(metric(beta, (s) => s.lcp))} |`
    )
  }
lines.push(
  '',
  '## Cold-load bytes and memory',
  '',
  'JavaScript transfer includes response headers and prefetches observed during the settling window. Decoded JavaScript measures uncompressed bodies. JS heap is sampled after forced garbage collection; it excludes native image/Blob storage. Renderer RSS includes native allocations and shared resident pages, so it is not an exclusive physical-memory measurement.',
  '',
  '| Scenario | Legacy JS KiB transferred | Beta JS KiB transferred | Legacy JS KiB decoded | Beta JS KiB decoded | Legacy heap MiB | Beta heap MiB | Legacy renderer RSS MiB | Beta renderer RSS MiB |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |'
)
for (const scenario of scenarios) {
  const old = samples(scenario, 'legacy', 'cold'),
    beta = samples(scenario, 'beta', 'cold')
  lines.push(
    `| ${scenario} | ${kib(
      metric(old, (s) => assets(s, '.js', 'transferBytes'))
    )} | ${kib(metric(beta, (s) => assets(s, '.js', 'transferBytes')))} | ${kib(
      metric(old, (s) => assets(s, '.js', 'decodedBytes'))
    )} | ${kib(metric(beta, (s) => assets(s, '.js', 'decodedBytes')))} | ${mib(
      metric(old, (s) => s.memory.jsHeapBytes)
    )} | ${mib(metric(beta, (s) => s.memory.jsHeapBytes))} | ${mib(
      metric(old, (s) => s.memory.rendererRssBytes)
    )} | ${mib(metric(beta, (s) => s.memory.rendererRssBytes))} |`
  )
}
lines.push(
  '',
  '## Total cold page transfer',
  '',
  'Totals include the document and same-origin resources observed during the settling window, including prefetches. Stored library image bytes are read locally and are not network downloads. Service-response fixtures are excluded from native fetch resource timing.',
  '',
  '| Scenario | Legacy total KiB | Beta total KiB | Legacy CSS KiB | Beta CSS KiB |',
  '| --- | ---: | ---: | ---: | ---: |'
)
for (const scenario of scenarios) {
  const old = samples(scenario, 'legacy', 'cold')
  const beta = samples(scenario, 'beta', 'cold')
  const total = (s) =>
    s.html.transferBytes +
    s.resources.reduce((sum, r) => sum + r.transferBytes, 0)
  lines.push(
    `| ${scenario} | ${kib(metric(old, total))} | ${kib(
      metric(beta, total)
    )} | ${kib(metric(old, (s) => assets(s, '.css', 'transferBytes')))} | ${kib(
      metric(beta, (s) => assets(s, '.css', 'transferBytes'))
    )} |`
  )
}
lines.push(
  '',
  '## Direct public HTTP',
  '',
  'Three interleaved samples per route and lane; each opens a new TLS connection. HTML bytes are compressed response bodies. Server/CDN caches are not flushed.',
  '',
  '| Route | Legacy TTFB ms | Beta TTFB ms | Legacy HTML KiB | Beta HTML KiB |',
  '| --- | ---: | ---: | ---: | ---: |'
)
for (const route of [...new Set(report.http.map((s) => s.route))]) {
  const old = report.http.filter(
      (s) => s.route === route && s.lane === 'legacy'
    ),
    beta = report.http.filter((s) => s.route === route && s.lane === 'beta')
  lines.push(
    `| ${route} | ${Math.round(metric(old, (s) => s.ttfbMs))} | ${Math.round(
      metric(beta, (s) => s.ttfbMs)
    )} | ${kib(metric(old, (s) => s.bytes))} | ${kib(
      metric(beta, (s) => s.bytes)
    )} |`
  )
}
lines.push(
  '',
  '## Repeated image inspection',
  '',
  'Ten image open/close cycles per populated profile. The range uses checkpoints from cycles 2–10 to show oscillation rather than treating one terminal heap sample as a leak diagnosis.',
  '',
  '| Lane | Library | Initial heap MiB | Heap range after opening MiB | Initial renderer RSS MiB | Final renderer RSS MiB |',
  '| --- | --- | ---: | ---: | ---: | ---: |'
)
for (const row of report.memoryCycles) {
  const heap = row.checkpoints.slice(1).map((c) => c.jsHeapBytes)
  lines.push(
    `| ${row.lane} | ${row.scenario} | ${mib(
      row.checkpoints[0].jsHeapBytes
    )} | ${mib(Math.min(...heap))}–${mib(Math.max(...heap))} | ${mib(
      row.checkpoints[0].rendererRssBytes
    )} | ${mib(row.checkpoints.at(-1).rendererRssBytes)} |`
  )
}
lines.push(
  '',
  'The ten-cycle samples show retained memory after inspecting images and oscillating heaps in both releases. They do not establish a long-session leak rate or device OOM safety.',
  '',
  'Raw JSON includes resource bytes, compression, FCP/LCP/CLS, observed long-task blocking, CDP task/script/layout durations, process RSS and all individual samples. Separate warm-create traces are saved alongside it; trace overhead is excluded from the tabulated samples. Sealed baseline hashes are verified after the run.',
  '',
  'References: [Resource Timing](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming), [Chrome memory measurements](https://developer.chrome.com/docs/devtools/memory-problems), [CDP Performance](https://chromedevtools.github.io/devtools-protocol/tot/Performance/).',
  ''
)
console.log(lines.join('\n'))
