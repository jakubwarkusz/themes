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

The full runtime variant is intentionally retained for further optimization. Relative to
the unchanged bundle baseline, the default client boundary grows by 640 B raw / 282 B gzip,
and the extended boundary by 687 B raw / 283 B gzip. These exceed the existing budgets.
Neither the budgets nor the baseline have been raised or refreshed to hide that growth.
The branch is not yet ready to merge under the current size policy.
