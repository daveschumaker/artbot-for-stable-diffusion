# Legacy and beta performance comparison

Legacy build **202508182305**; beta build **202611111801**.
3 paired rounds, Chromium 145.0.7632.6, 1440 × 1000, no CPU/network throttling.

The same sealed profiles are copied for both lanes. HTTP cache is cleared before the first load; a repeat load uses the native browser cache. Other persisted profile state, including browser code caches, is retained. Fixed service fixtures isolate application assets and browser work from live Horde/model API latency. Browser traffic passes through a local read-only relay; response bodies are unchanged. The separate direct-HTTP measurements below include a new TLS connection.

These are desktop lab medians, not field percentiles or iPhone results. They compare two whole releases and do not isolate the effect of Node alone.

## Time to usable UI

Create is ready when the prompt field is visible; drawing when its canvas is visible; a populated gallery when its first image is decoded. Measurements include navigation and framework startup. Models use the same eight fixture entries in both lanes.

| Scenario       | Cache | Legacy ready ms | Beta ready ms | Change | Legacy FCP ms | Beta FCP ms | Legacy LCP ms | Beta LCP ms |
| -------------- | ----- | --------------: | ------------: | -----: | ------------: | ----------: | ------------: | ----------: |
| empty-create   | cold  |             405 |           712 |  75.8% |           400 |         144 |           400 |         680 |
| empty-create   | warm  |             230 |           224 |  -2.5% |           176 |          88 |           176 |         252 |
| empty-images   | cold  |             252 |           363 |  43.8% |           296 |         132 |           296 |         348 |
| empty-images   | warm  |             200 |           219 |   9.4% |           212 |         108 |           212 |         176 |
| empty-draw     | cold  |             737 |           690 |  -6.4% |           372 |         140 |           372 |         140 |
| empty-draw     | warm  |             602 |           561 |  -6.8% |           168 |          76 |           168 |          76 |
| empty-settings | cold  |             713 |           682 |  -4.4% |           304 |         132 |           604 |         632 |
| empty-settings | warm  |             204 |           578 | 182.7% |           136 |          96 |           204 |         524 |
| library-245    | cold  |             586 |           601 |   2.5% |           344 |         208 |           648 |         624 |
| library-245    | warm  |             392 |           393 |   0.3% |           140 |          72 |           412 |         444 |
| library-1721   | cold  |             549 |           571 |   4.1% |           324 |         172 |           596 |         668 |
| library-1721   | warm  |             365 |           382 |   4.4% |           168 |          76 |           404 |         440 |

## Cold-load bytes and memory

JavaScript transfer includes response headers and prefetches observed during the settling window. Decoded JavaScript measures uncompressed bodies. JS heap is sampled after forced garbage collection; it excludes native image/Blob storage. Renderer RSS includes native allocations and shared resident pages, so it is not an exclusive physical-memory measurement.

| Scenario       | Legacy JS KiB transferred | Beta JS KiB transferred | Legacy JS KiB decoded | Beta JS KiB decoded | Legacy heap MiB | Beta heap MiB | Legacy renderer RSS MiB | Beta renderer RSS MiB |
| -------------- | ------------------------: | ----------------------: | --------------------: | ------------------: | --------------: | ------------: | ----------------------: | --------------------: |
| empty-create   |                       514 |                     599 |                  1628 |                1918 |               8 |           9.2 |                   287.7 |                 293.6 |
| empty-images   |                       547 |                     618 |                  1710 |                1963 |             5.7 |           5.9 |                   275.9 |                 280.2 |
| empty-draw     |                       653 |                     719 |                  2075 |                2290 |             6.9 |             7 |                   278.6 |                 287.8 |
| empty-settings |                       579 |                     668 |                  1801 |                2113 |               7 |           7.2 |                   280.1 |                   283 |
| library-245    |                       547 |                     552 |                  1710 |                1787 |            38.9 |          39.4 |                   373.3 |                   372 |
| library-1721   |                       547 |                     552 |                  1710 |                1787 |            29.2 |          27.6 |                   368.4 |                 363.4 |

## Total cold page transfer

Totals include the document and same-origin resources observed during the settling window, including prefetches. Stored library image bytes are read locally and are not network downloads. Service-response fixtures are excluded from native fetch resource timing.

| Scenario       | Legacy total KiB | Beta total KiB | Legacy CSS KiB | Beta CSS KiB |
| -------------- | ---------------: | -------------: | -------------: | -----------: |
| empty-create   |              676 |            765 |             50 |           50 |
| empty-images   |              745 |            825 |             44 |           49 |
| empty-draw     |              848 |            927 |             41 |           49 |
| empty-settings |              782 |            877 |             43 |           50 |
| library-245    |              768 |            756 |             44 |           49 |
| library-1721   |              768 |            747 |             44 |           49 |

## Direct public HTTP

Three interleaved samples per route and lane; each opens a new TLS connection. HTML bytes are compressed response bodies. Server/CDN caches are not flushed.

| Route                        | Legacy TTFB ms | Beta TTFB ms | Legacy HTML KiB | Beta HTML KiB |
| ---------------------------- | -------------: | -----------: | --------------: | ------------: |
| create                       |             47 |           41 |               4 |             4 |
| images                       |             34 |           38 |               3 |             4 |
| draw                         |             36 |           38 |               3 |             4 |
| settings?panel=import-export |             36 |           41 |               3 |             4 |

## Repeated image inspection

Ten image open/close cycles per populated profile. The range uses checkpoints from cycles 2–10 to show oscillation rather than treating one terminal heap sample as a leak diagnosis.

| Lane   | Library      | Initial heap MiB | Heap range after opening MiB | Initial renderer RSS MiB | Final renderer RSS MiB |
| ------ | ------------ | ---------------: | ---------------------------: | -----------------------: | ---------------------: |
| legacy | library-245  |             38.8 |                      58–79.6 |                    380.2 |                  454.3 |
| beta   | library-245  |             39.4 |                    60.3–80.3 |                    379.5 |                  464.2 |
| legacy | library-1721 |             29.4 |                    52.5–75.5 |                      390 |                  447.9 |
| beta   | library-1721 |             29.3 |                    52.5–53.1 |                    392.2 |                  453.9 |

The ten-cycle samples show retained memory after inspecting images and oscillating heaps in both releases. They do not establish a long-session leak rate or device OOM safety.

Raw JSON includes resource bytes, compression, FCP/LCP/CLS, observed long-task blocking, CDP task/script/layout durations, process RSS and all individual samples. Separate warm-create traces are saved alongside it; trace overhead is excluded from the tabulated samples. Sealed baseline hashes are verified after the run.

References: [Resource Timing](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming), [Chrome memory measurements](https://developer.chrome.com/docs/devtools/memory-problems), [CDP Performance](https://chromedevtools.github.io/devtools-protocol/tot/Performance/).
