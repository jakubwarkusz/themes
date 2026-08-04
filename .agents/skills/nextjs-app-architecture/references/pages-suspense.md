# Pages and Suspense

How to compose pages, place Suspense boundaries, and prevent layout shift.

## Pages are composition only

Pages in `app/` import feature components and place `<Suspense>` boundaries. They never:

- Fetch data directly (queries live in feature folders)
- Define new components except thin transition wrappers (e.g. `<ViewTransition>`)
- Inline route-specific UI (extract it into the feature folder)
- Pass raw `params` / `searchParams` to features

## Page function signatures

Type page and layout functions with the auto-generated `PageProps<'/route'>` / `LayoutProps<'/route'>` helpers — no import, regenerated on `next dev` / `next build` / `next typegen`. See [route type helpers](https://preview.nextjs.org/docs/app/api-reference/config/typescript#route-type-helpers).

```tsx
export default function PostPage({ params }: PageProps<'/post/[id]'>) { /* ... */ }
```

Don't hand-write `{ params: Promise<{ id: string }> }` — the generated types stay in sync with the route (catch-all, optional segments). Route handlers use `RouteContext<'/api/...'>`. `typedRoutes: true` is a *separate* feature (statically-typed `href`s), not the source of these helpers.

## Keep pages synchronous

Use `params.then()` instead of `await params`. Content above the `.then()` pre-renders into the static shell; content inside it suspends.

```tsx
import { Suspense } from 'react';
import { PostDetail, PostDetailSkeleton } from '@/features/post/components/post-detail';

export default function PostPage({ params }: PageProps<'/post/[id]'>) {
  return (
    <div>
      <h1>Post</h1>
      <Suspense fallback={<PostDetailSkeleton />}>
        {params.then(({ id }) => (
          <PostDetail id={id} />
        ))}
      </Suspense>
    </div>
  );
}
```

The `<h1>` sits **above** the `params.then()` so it paints instantly. The `Suspense` fallback covers only the dynamic section.

Resolve route props to plain values at this boundary. Feature components receive `id`, `slug`, `query`, or parsed filter values — not `params`, `searchParams`, or unresolved server promises.

### Implicit return inside `.then()`

Use an implicit-return arrow function when the callback just renders JSX — e.g. `({ id }) => <PostDetail id={id} />`. Only switch to a block body with `return` when you need to do work first (destructure with defaults, parse a `searchParams` value, branch on a condition). This keeps the JSX-in-page shape readable and matches how the resolved tree will look.

### `searchParams` and combined params

```tsx
// searchParams only
export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return searchParams.then(sp => {
    const q = typeof sp.q === 'string' ? sp.q : '';
    return q ? <SearchResults query={q} /> : <EmptyState />;
  });
}

// Both params and searchParams
export default function ProfilePage({ params, searchParams }: PageProps<'/u/[handle]'>) {
  return Promise.all([params, searchParams]).then(([{ handle }, sp]) => (
    <ProfileFeed handle={handle} tab={parseTab(sp.tab)} />
  ));
}
```

### Metadata, static params, and `notFound()`

- [`generateMetadata`](https://preview.nextjs.org/docs/app/api-reference/functions/generate-metadata) runs before render, so `await params` is fine there — it's a separate async function, not the page body, so it doesn't make the page dynamic.
- Export [`generateStaticParams`](https://preview.nextjs.org/docs/app/api-reference/functions/generate-static-params) from a `[slug]` page/layout to pre-build a known set of slugs; with `cacheComponents` + `'use cache'` they land in the static shell. It does **not** change the page signature — `params` is still a Promise, still consumed with `params.then()`.
- A query that can't find its resource calls [`notFound()`](https://preview.nextjs.org/docs/app/api-reference/functions/not-found), which bubbles to the nearest [`not-found.tsx`](https://preview.nextjs.org/docs/app/api-reference/file-conventions/not-found). Don't try/catch it — use [`unstable_rethrow`](https://preview.nextjs.org/docs/app/api-reference/functions/unstable_rethrow) if you must catch nearby.

## The page owns the Suspense boundary

The feature exports the async component **and** its skeleton. The page imports both and places the boundary. Don't pre-wrap inside the feature — that hides the boundary and prevents grouping siblings.

```tsx
// features/post/components/post-detail.tsx
export async function PostDetail({ id }: { id: string }) { ... }
export function PostDetailSkeleton() { ... }
```

```tsx
// app/post/[id]/page.tsx
<Suspense fallback={<PostDetailSkeleton />}>
  {params.then(({ id }) => (
    <>
      <PostDetail id={id} />
      <ErrorBoundary title="Replies didn't load">
        <Suspense fallback={<RepliesSkeleton />}>
          <Replies postId={id} />
        </Suspense>
      </ErrorBoundary>
    </>
  ))}
</Suspense>
```

If a page uses a transition wrapper (e.g. `<ViewTransition>`), place it in the page next to the `<Suspense>` boundary. Feature components render content and skeletons, not transition wrappers.

## Audit smells

When auditing an existing app, flag and fix these first:

- `export default async function Page(...)` that only awaits `params`, `searchParams`, or page-level queries.
- `import { getSomething } from '@/features/.../*-queries'` inside `app/**/page.tsx` or `layout.tsx`.
- Feature components whose props are `params`, `searchParams`, or a route-shaped object.
- Page-local components like `HomeContent`, `PostShell`, or `ResultsSection` that only exist to fetch data or group a Suspense fallback.
- `<Suspense>` inside feature components that prevents the page from grouping reveal behavior.

## Don't create page-local wrapper components

Avoid components whose only job is to group boundary content, like `HomeLists` or `HomeListsSkeleton`. Keep the resolved JSX and fallback JSX **inline in the page** so the loading shape, headings, and grouped reveal behavior are visible at the boundary.

```tsx
// Wrong — hides the structure behind a wrapper
<Suspense fallback={<HomeListsSkeleton />}>
  <HomeLists searchParams={searchParams} />
</Suspense>
```

```tsx
// Right — structure visible at the page level
<Suspense
  fallback={
    <>
      <FeaturedSkeleton />
      <RecentSkeleton />
    </>
  }
>
  {searchParams.then(sp => (
    <>
      <Featured filter={sp.filter} />
      <Recent filter={sp.filter} />
    </>
  ))}
</Suspense>
```

The same applies to feature-level skeleton aliases. If a variant only passes props to a base skeleton, import the base skeleton and pass those props inline in `fallback={...}`.

## Suspense boundary placement rules

1. **First section gets its own Suspense** with a known-height skeleton fallback.
2. **Section headings stay outside Suspense** when their final position is stable.
3. **Variable-height sections: group everything below them** in the same Suspense, including any headings that would otherwise paint in the wrong vertical position.
4. **Fixed-height sections: own boundary is safe.**
5. **Variable-length lists: show 2–5 skeleton items**, not the real count.
6. **Inner Suspense content stays out of the outer skeleton.** Each boundary owns its own.
7. **Never `fallback={null}` for visible UI.** If a boundary covers UI, give it a real shaped fallback, or group it with a sibling boundary that already has the correct fallback.
8. **If the top section's final height is unknown, group the following sections** in the same boundary so they reveal together and don't jump underneath.

## Error boundaries

Wrap fallible sections in a Next.js-aware error boundary so one failure doesn't take down the page. Build it on [`catchError`](https://preview.nextjs.org/docs/app/api-reference/functions/catchError) from `next/error` (its `ErrorInfo` gives you a `retry()` that re-fetches server data) — it understands Next's control-flow throws (`notFound()`, `redirect()`, `unauthorized()`, `forbidden()`) and won't swallow them. Place the boundary around the suspending section, in the page:

```tsx
<ErrorBoundary title="Replies didn't load">
  <Suspense fallback={<RepliesSkeleton />}>
    <Replies postId={id} />
  </Suspense>
</ErrorBoundary>
```

Why not plain `react-error-boundary`? It catches Next's framework throws (so `notFound()` never reaches `not-found.tsx`), and its reset doesn't re-fetch server data. Background: [Error Handling in Next.js with catchError](https://aurorascharff.no/posts/error-handling-in-nextjs-with-catch-error/).

Pair component-level boundaries with route-segment [`error.tsx`](https://preview.nextjs.org/docs/app/api-reference/file-conventions/error) for unrecoverable errors; it also receives a `retry` callback.

## Layout-level Suspense

Layouts compose feature components the same way pages do. Use `<Suspense>` for slots that fetch data (auth badge, sidebar):

```tsx
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html>
      <body>
        <Suspense>
          <AuthGate userPromise={getCurrentUser()} />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

`AuthGate` is a client component that resolves the promise with `use()` so the dialog can render conditionally without server-side branching.

## CLS prevention

Layout shift happens when:

- A skeleton is shorter than the real content
- A heading sits inside a Suspense boundary whose final height is unknown — it paints in the wrong place, then jumps
- A variable-length list streams in without a fallback that reserves space

Fixes:

- Match skeleton height to the typical real content height.
- Move headings **outside** boundaries when their position depends on data above them.
- For unknown-height top sections, group everything below in one boundary so siblings stream together.

To audit CLS, use React DevTools' Suspense panel to pin each boundary in its loading state and check vertical positions.

## Runtime prefetch for high-value routes

With `cacheComponents` + [`partialPrefetching`](https://preview.nextjs.org/docs/app/api-reference/config/next-config-js/partialPrefetching) enabled, a visible `<Link>` prefetches the destination's shared [App Shell](https://preview.nextjs.org/docs/app/glossary#app-shell) — enough to commit navigation instantly, with link-specific content streaming after. The default (`'auto'`) already does this; don't write `prefetch = 'auto'`.

Use `<Link prefetch={true}>` on high-value links to also resolve the destination's per-link runtime data (`params`, `searchParams`, the full URL) before the click. Each such link can wake the server for a runtime prerender, so reserve it for routes users predictably visit next. See [runtime prefetching](https://preview.nextjs.org/docs/app/guides/runtime-prefetching).

Can't enable `partialPrefetching` app-wide yet? Opt in per route with `export const prefetch = 'partial'` on the destination, then drop the per-route exports once the global flag is on — see [Adopting Partial Prefetching](https://preview.nextjs.org/docs/app/guides/adopting-partial-prefetching) for the incremental path and [prefetch config](https://preview.nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/prefetch) for the options. To validate navigation feels instant, see the [`instant` config](https://preview.nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant) and [Instant Navigation guide](https://preview.nextjs.org/docs/app/guides/instant-navigation).

## Never wrap the entire page in a Suspense fallback

Page chrome (header, nav, surrounding layout) should paint instantly. Only data-dependent sections suspend. If you find yourself wrapping `<div>` and everything in it with `<Suspense fallback={<FullPageSkeleton />}>`, restructure: pull static elements out, narrow the boundary to just the dynamic part.
