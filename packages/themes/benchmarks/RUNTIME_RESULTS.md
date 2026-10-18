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
