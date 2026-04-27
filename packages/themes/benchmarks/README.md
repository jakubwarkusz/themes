# Bundle Size Benchmarks

These fixtures measure small, realistic `@wrksz/themes` consumption cases:

- `use-theme`: imports `useTheme` from `@wrksz/themes/client`
- `use-theme-value`: imports `useThemeValue` from `@wrksz/themes/client`
- `themed-image`: imports `ThemedImage` from `@wrksz/themes/client`
- `next-provider`: imports `ThemeProvider` from `@wrksz/themes/next`

Run the benchmark from the repository root:

```bash
bun run --cwd packages/themes size
```

The script builds the package, bundles each fixture with React and Next peer dependencies
externalized, prints raw and gzip sizes, and fails when a fixture exceeds
`bundle-size-thresholds.json`.

When an intentional change increases size, update only the affected threshold and mention the
measured before/after values in the pull request.
