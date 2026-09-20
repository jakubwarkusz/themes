# Contributing

## Setup

Install Node.js 24.11+ LTS or 26+ and pnpm 11.x. pnpm manages dependencies and runs workspace scripts; Vitest runs tests and tsdown builds the library. Then run:

```sh
CI=true pnpm install --frozen-lockfile
pnpm verify
```

Use `pnpm verify:full` before requesting release review. It adds TypeScript 5.9/6/7 declaration checks, bundle comparison, production builds, dependency audit, and the Next.js Playwright fixture. Install Chromium once with `pnpm --filter next-16-3-compat exec playwright install chromium`.

## Change expectations

- Add characterization tests before changing bootstrap or provider behavior.
- Exercise equivalent configurations through `getScript`, direct DOM application, and provider wiring.
- Keep the package free of runtime dependencies.
- Update package exports, tsdown JavaScript/declaration entries, and `scripts/smoke-exports.ts` together.
- Review bundle baselines after correctness work; never raise a threshold solely to pass CI.
- After building, run `pnpm --filter @wrksz/themes size:package` to check the actual npm publish file list against the 64,000-byte unpacked package budget. This includes JavaScript, declarations, README and manifest; it is separate from browser bundle budgets. CI and publishing enforce both.
- Use conventional commit messages.

The supported minimums are React 18+, React DOM 18+, Next.js 16, and TypeScript 5.9. React 19.2+ uses the native `useEffectEvent`; React 18 and earlier React 19 releases use the compatibility fallback. The `apps/next-16-3` preview fixture protects behavior against upcoming Next.js routing changes.

API documentation belongs in `apps/docs/content/docs`; avoid parallel prop tables in README files. Releases are tag-driven from `vMAJOR.MINOR.PATCH` tags, optionally with dot-separated prerelease identifiers, and are published only by the provenance-enabled workflow.
