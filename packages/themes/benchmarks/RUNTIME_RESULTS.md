# Runtime optimization measurements

Comparison against `6aed1a2`, using Node.js 26.8.2, the same local Vitest/happy-dom
dependencies, and `runtime.bench.ts` on an isolated source snapshot and the working tree.
Measurements are local synthetic workloads, not browser rendering or navigation timings.

| Workload (1,000 operations)                           | Before, median ms | After, median ms |
| ----------------------------------------------------- | ----------------: | ---------------: |
| Unchanged DOM application                             |             0.304 |            0.309 |
| Unrelated class mutation batches, flushing each frame |             0.378 |            0.047 |
| Rapid theme changes in one frame, including cleanup   |            55.133 |            3.576 |

The unchanged-application case does not demonstrate a latency improvement. Token caching
reuses arrays instead of splitting the same strings repeatedly; the cache is bounded to
32 entries. More complex class mappings and allocation profiles need separate measurements.

Observer filtering removes theme applications and scheduled frames for unrelated class
mutations. Descendant child-list changes remain relevant to an ancestor theme target to
preserve Instant Navigation restoration. Scoped targets, target replacement, changing
selector matches, late targets, unsubscribe, and Activity restoration retain coverage.

Transition suppression shares one style and one two-frame cleanup sequence for each
root/value pair. Repeated changes extend the lifetime without scheduling additional
callbacks. Different values and ShadowRoot scopes remain independent; the most recently
requested style keeps its cascade position. The 1,000-change case exaggerates this benefit
relative to ordinary user-driven theme toggles.

## Remaining size tradeoff

The full runtime variant is retained. A follow-up simplification shares transition-style
attachment and countdown reset between new and reused styles, saving 22 B raw per provider
fixture. The parity suite queues animation frames instead of invoking callbacks synchronously,
so cleanup is tested after DOM application, as in a browser.

After rebuilding, the default client boundary measures 8,239 B raw / 3,537 B gzip
(+618 B / +274 B against the unchanged baseline). The extended boundary measures
9,932 B raw / 4,094 B gzip (+665 B / +275 B). Gzip results can vary with build output.

These savings do not offset the added runtime behavior. The user explicitly approved
accepting the remaining size cost if optimization alone did not meet the old limits.
Only exceeded provider/factory budgets are increased, with small margins for build variation;
hook, script, image, and package-install budgets are unchanged. The baseline is not refreshed,
so reports continue to expose the cost rather than resetting the deltas to zero.

## Child-list scanning

Compared with `8f90540` on macOS with Node.js 26.8.2. The browser harness ran both
compiled observers on the production Next.js 16.4.5 fixture in Chromium 156.
It alternated the implementations, timing only their MutationObserver callbacks for
40 measured batches after eight warmups. Each batch had 600 real child-list records
under a document root and outside eight scoped targets.

| Workload                                     | Before, median ms | After, median ms |
| -------------------------------------------- | ----------------: | ---------------: |
| Chromium, one added and one removed node     |               1.5 |              1.3 |
| Chromium, 16 added and 16 removed nodes      |              13.3 |            11.05 |
| Happy DOM, 1,000 records across eight scopes |             1.596 |            0.813 |

The Chromium numbers measure callback time in a scripted workload. The Happy DOM
benchmark uses synthetic observer delivery. Provider and factory bundle fixtures
shrank by 30 B raw and 3–6 B gzip. The unpacked package shrank from 59,401 B to
59,357 B. Full verification passed, including Chromium, Firefox, and WebKit E2E.

## Typed Next factory payload

Two static Next.js 16.4.5 production Turbopack builds render the same route and theme
control. The plain variant uses the server `ThemeProvider` and the typed variant uses
`createThemes` from `@wrksz/themes/next/create-themes`. Both use the same built library.

| Gzip bytes                       | Server provider | Typed factory |  Delta |
| -------------------------------- | --------------: | ------------: | -----: |
| Unique script chunks in the HTML |         177,944 |       179,181 | +1,237 |
| HTML with embedded RSC           |           2,634 |         2,427 |   -207 |
| Total                            |         180,578 |       181,608 | +1,030 |

The script total sums each referenced file compressed separately. The HTML includes
the inline bootstrap and embedded RSC. These sizes exclude response headers and
describe build artifacts under gzip, with every resource counted once.
