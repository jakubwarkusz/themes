# AGENTS.md

## Cursor Cloud specific instructions

This is a Bun-managed TypeScript monorepo (Bun workspaces). Two workspaces:

- `packages/themes` — `@wrksz/themes`, the shippable theme-management library (this is the product).
- `apps/docs` — `theme-docs`, the Next.js + Fumadocs documentation site that consumes the library. Run it to manually exercise the library end to end.

There is no backend, database, or external service. Bun is the package manager (CI pins `1.3.9`). Bun is installed at `~/.bun/bin`.

### Gotcha: `bun install` and git hooks

The package `prepare` scripts run `lefthook install`, which fails in Cursor Cloud because a custom `core.hooksPath` is set. This makes a bare `bun install` exit non-zero. Always install with `CI=true` so the `prepare`/lefthook step is skipped:

```bash
CI=true bun install
```

(The startup update script already does this.)

### Common commands (run from repo root)

- Lint: `bun run lint` (Biome over `packages` and `apps`)
- Test (library): `bun run test`
- Type-check library: `bun run --cwd packages/themes type-check`
- Type-check docs: `bun run --cwd apps/docs types:check`
- Build library: `bun run build` (outputs `packages/themes/dist`)
- Run docs dev server: `bun run dev:docs` → http://localhost:3000

The docs app depends on the library source via `workspace:*`; building the library is not required for `dev:docs` to run.
