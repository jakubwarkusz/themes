# @wrksz/themes documentation

This Fumadocs application is the canonical API and examples site for `@wrksz/themes`.

From the repository root:

```sh
CI=true bun install --frozen-lockfile
bun run dev:docs
```

Run `bun run test:docs`, `bun run type-check`, and `bun run build:docs` before submitting documentation changes. Content lives in `content/docs`; shared navigation and source configuration live in `src/lib`.

Keep API details here and link to them from README files instead of maintaining duplicate prop tables. Repository-wide contribution and release guidance is in [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md).
