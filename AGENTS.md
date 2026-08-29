# Agent guidance

## Repository map

- `packages/themes`: publishable library, tests, build configuration, and bundle budgets.
- `apps/docs`: canonical API documentation and examples.
- `apps/next-16-3`: preview fixture for Next.js Instant Navigation, hydration, and bootstrap behavior.

## Working rules

- Use pnpm 11.x for dependency management: `CI=true pnpm install --frozen-lockfile`.
- Use Bun 1.3.x as the runtime for tests (`bun test`) and builds (Bunup).
- Keep runtime dependencies at zero and imports at module scope.
- Preserve bootstrap/runtime parity: changes to the inline script, DOM applier, or providers need equivalent tests.
- Keep package exports, Bunup runtime/declaration entries, and smoke imports in lockstep.
- Do not increase bundle budgets merely to make CI pass.
- Public support starts at React/React DOM 18, Next.js 16, and TypeScript 5.9.
- React 19.2+ uses the native `useEffectEvent`; React 18 and earlier React 19 releases use the compatibility fallback.

## Verification

- Fast: `pnpm verify`
- Full release/CI parity: `pnpm verify:full`
- Library only: `pnpm --filter @wrksz/themes test`

The docs site is the canonical API reference. Link to it instead of duplicating prop tables.
