# Contributing

## Setup

Install Bun 1.3.x, then run:

```sh
CI=true bun install --frozen-lockfile
bun run verify
```

Use `bun run verify:full` before requesting release review. It adds TypeScript 5.9/6/7 declaration checks, bundle comparison, production builds, dependency audit, and the Next.js Playwright fixture.

## Change expectations

- Add characterization tests before changing bootstrap or provider behavior.
- Exercise equivalent configurations through `getScript`, direct DOM application, and provider wiring.
- Keep the package free of runtime dependencies.
- Update package exports, Bunup JavaScript/declaration entries, and `scripts/smoke-exports.ts` together.
- Review bundle baselines after correctness work; never raise a threshold solely to pass CI.
- Use conventional commit messages.

The supported minimums are React and React DOM 19.2, Next.js 16, and TypeScript 5.9. The `apps/next-16-3` preview fixture protects behavior against upcoming Next.js routing changes.

API documentation belongs in `apps/docs/content/docs`; avoid parallel prop tables in README files. Releases are tag-driven from `vMAJOR.MINOR.PATCH` tags, optionally with dot-separated prerelease identifiers, and are published only by the provenance-enabled workflow.
