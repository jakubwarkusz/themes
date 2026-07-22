# Bundle Size Benchmarks

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

Run the benchmark from the repository root:

```bash
bun run --cwd packages/themes size
```

The script builds the package, bundles each fixture with React and Next peer dependencies
externalized, `process.env.NODE_ENV` set to `"production"` (so JSX uses the production
runtime), prints raw and gzip sizes, and fails when a fixture exceeds
`bundle-size-thresholds.json`.

When an intentional change increases size, update only the affected threshold and mention the
measured before/after values in the pull request.

## Compare against a baseline

CI compares every run against the committed baseline:

```bash
bun run --cwd packages/themes size:compare benchmarks/baseline.json
```

When an intentional change changes bundle size, update `baseline.json` with the new report:

```bash
bun run --cwd packages/themes size:update-baseline
```

Then review the `benchmarks/baseline.json` diff before committing it.

For one-off local comparisons, save a temporary baseline before making a change:

```bash
bun run --cwd packages/themes size:json > /tmp/wrksz-themes-before.json
```

Then compare the current branch against it:

```bash
bun run --cwd packages/themes size:compare /tmp/wrksz-themes-before.json
```

The comparison table prints current size, baseline size, raw/gzip byte deltas, and percentage
deltas for every fixture.

`bundle-size-thresholds.json` contains two kinds of budgets:

- `maxBytes` / `maxGzipBytes`: hard per-fixture size limits, always checked.
- `maxDeltaBytes` / `maxDeltaGzipBytes`: allowed growth versus a baseline, checked only when
  `--compare` is used.
