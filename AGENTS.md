# Agent guidance

## Repository map

- `packages/themes`: publishable library, tests, build configuration, and bundle budgets.
- `apps/docs`: canonical API documentation and examples.
- `apps/next-16-3`: preview fixture for Next.js Instant Navigation, hydration, and bootstrap behavior.

## Working rules

- Use Bun 1.3.x and run `CI=true bun install --frozen-lockfile`.
- Keep runtime dependencies at zero and imports at module scope.
- Preserve bootstrap/runtime parity: changes to the inline script, DOM applier, or providers need equivalent tests.
- Keep package exports, Bunup runtime/declaration entries, and smoke imports in lockstep.
- Do not increase bundle budgets merely to make CI pass.
- Public support starts at React/React DOM 19.2, Next.js 16, and TypeScript 5.9.

## Verification

- Fast: `bun run verify`
- Full release/CI parity: `bun run verify:full`
- Library only: `bun run --cwd packages/themes test`

The docs site is the canonical API reference. Link to it instead of duplicating prop tables.
