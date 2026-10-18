# Bundle Size Benchmarks

## Published package

`pnpm --filter @wrksz/themes build` preserves the runtime modules and client boundaries,
then bundles declarations into public entrypoints backed by a shared declaration file.
JSDoc is retained. Development watch builds keep their module-preserving declarations.

The build also prepares `packages/themes/.publish/` with `dist`, README, agent guidance,
and a manifest derived from the source package.json without `scripts` or `devDependencies`.
Exports, peer requirements, version, license metadata, and other consumer fields are preserved.
The source manifest is never rewritten by this step; release tags are applied before building.

`pnpm --filter @wrksz/themes size:package` refreshes that staging directory, measures its npm
pack contents, checks declaration imports and export paths, and smoke-imports the staged
package. The release workflow publishes **that directory**, not the workspace package root.
For a local tarball, build first and run `npm pack ./packages/themes/.publish --ignore-scripts`
from the repository root. Do not publish the workspace root package directly.

## Client bundles

These fixtures measure small, realistic `@wrksz/themes` consumption cases:

- `use-theme`: imports `useTheme` from `@wrksz/themes/client`
- `use-theme-subpath`: imports `useTheme` from `@wrksz/themes/client/use-theme`
- `use-theme-value`: imports `useThemeValue` from `@wrksz/themes/client`
- `use-theme-value-subpath`: imports `useThemeValue` from `@wrksz/themes/client/use-theme-value`
- `themed-image`: imports `ThemedImage` from `@wrksz/themes/client`
- `themed-image-subpath`: imports `ThemedImage` from `@wrksz/themes/client/themed-image`
- `next-provider`: imports `ThemeProvider` from `@wrksz/themes/next`
- `extended-next-provider`: imports the opt-in `ThemeProvider` from
  `@wrksz/themes/next/extended` with system mapping and same-document synchronization enabled
- `next-client-boundary`: bundles the built internal `ClientNextThemeProvider` and its imports
- `extended-next-client-boundary`: bundles the built internal `ExtendedClientNextThemeProvider` and its imports
- `next-factory`: exports a provider and matching hook from a typed Next factory
- `client-factory`: exports a provider and matching hook from a typed client-only factory

The client-boundary fixtures import internal `dist` modules deliberately; they are not new
public package exports. They measure the library code reachable from the client boundary,
without including the server wrapper. This captures improvements such as moving script
generation to the server, which the full `next-provider` fixtures cannot distinguish.
Factory fixtures use the public entrypoints and remain separate because their configuration
and provider are created in a client module. The client-only factory does not provide a bootstrap.

These measurements exclude React/Next runtime code, HTML, and RSC payloads. They are not the
total JavaScript transferred by an application. Before shipping a server/client split, also
compare a production Next build's client chunks and HTML/RSC. Embedded RSC in the initial HTML
must not be counted again as a separate response. Compression and a warm JS cache affect the balance.

Run the benchmark from the repository root:

```bash
pnpm --filter @wrksz/themes size
```

The script builds the package with tsdown, bundles each fixture with Rolldown and React/Next peer dependencies
externalized, `process.env.NODE_ENV` set to `"production"` (so JSX uses the production
runtime), prints raw and gzip sizes, and fails when a fixture exceeds
`bundle-size-thresholds.json`.

Changing the bundler or minifier can change these measurements independently of runtime source changes.

Existing budgets must not be raised to accommodate a change. Lower them after verified
reductions, and report measured before/after values in the pull request.

## Compare against a baseline

CI compares every run against the committed baseline:

```bash
pnpm --filter @wrksz/themes size:compare benchmarks/baseline.json
```

To deliberately refresh the complete baseline, use:

```bash
pnpm --filter @wrksz/themes size:update-baseline
```

Then review the `benchmarks/baseline.json` diff before committing it.
When adding a fixture, append only its measured baseline and budget; preserve existing entries
so their accumulated regressions are not reset. The client-boundary and factory entries record
the starting point before server-side bootstrap optimization.

For one-off local comparisons, save a temporary baseline before making a change:

```bash
pnpm --filter @wrksz/themes size:json > /tmp/wrksz-themes-before.json
```

Then compare the current branch against it:

```bash
pnpm --filter @wrksz/themes size:compare /tmp/wrksz-themes-before.json
```

The comparison table prints current size, baseline size, raw/gzip byte deltas, and percentage
deltas for every fixture.

`bundle-size-thresholds.json` contains two kinds of budgets:

- `maxBytes` / `maxGzipBytes`: hard per-fixture size limits, always checked.
- `maxDeltaBytes` / `maxDeltaGzipBytes`: allowed growth versus a baseline, checked only when
  `--compare` is used.

## Runtime workloads

Run the runtime microbenchmarks separately from correctness tests:

```bash
pnpm --filter @wrksz/themes exec vitest bench --run benchmarks/runtime.bench.ts
```

The three workloads measure batches of 1,000 unchanged DOM applications, unrelated class
mutations with a frame flush after each delivery, and rapid theme changes followed by two
animation frames. Use the same benchmark file, dependencies, and runtime for both revisions.
JSON results can be saved with `--reporter=json --outputFile=/tmp/themes-runtime.json`.

These are synthetic happy-dom measurements with controlled observer delivery and animation
frames, not browser frame times or end-user navigation latency. The rapid-change workload
is a stress case, not typical usage. Correctness tests separately cover selective observer
dispatch, bounded token reuse, transition-style reuse, and bootstrap/runtime parity. Real
Next.js navigation and Activity restoration remain covered by `pnpm verify:fixture`.
