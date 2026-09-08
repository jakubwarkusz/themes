<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./.github/images/banner-dark.webp">
  <img alt="A painted sky with a sun and moon sticker: day in light mode, night in dark mode" src="./.github/images/banner-light.webp">
</picture>

# @wrksz/themes

[![npm: @wrksz/themes](./.github/images/badges/npm.svg)](https://www.npmjs.com/package/@wrksz/themes)
[![docs: themes.wrksz.dev](./.github/images/badges/docs.svg)](https://themes.wrksz.dev)
[![changelog](./.github/images/badges/changelog.svg)](./CHANGELOG.md)
![next.js 16+](./.github/images/badges/nextjs.svg)
![react 18 and 19](./.github/images/badges/react.svg)
![typescript 5.9 to 7](./.github/images/badges/typescript.svg)

Theme management for Next.js 16+ and React 18 or 19. Supports custom themes, cookie and browser storage, scoped providers, and typed hooks. No runtime dependencies.

The API follows `next-themes` conventions. See the [migration guide](https://themes.wrksz.dev/docs/migration) for import changes and behavior differences.

TypeScript 5.9 or newer is required. TypeScript 5.9, 6, and 7 are supported and checked against the published package declarations in CI.

> **Upgrading from 1.x:** The Next.js provider no longer reads cookies on the server. Use `getTheme()` and `initialTheme` when server-rendered content needs the theme. Version 2 also changes forced-theme persistence and initialization behavior. See [Upgrading from 1.x](https://themes.wrksz.dev/docs/migration#upgrading-from-1x).

```bash
pnpm add @wrksz/themes
# or
npm install @wrksz/themes
```

## Why not `next-themes`?

|                                                 | next-themes | @wrksz/themes                   |
| ----------------------------------------------- | ----------- | ------------------------------- |
| React 19 script warning                         | Bug         | Fixed (`useServerInsertedHTML`) |
| `__name` minification bug                       | Bug         | Fixed                           |
| Stale theme with React 19 `cacheComponents`     | Bug         | Fixed (`useSyncExternalStore`)  |
| Multi-class theme removal leaving stale classes | Bug         | Fixed                           |
| Nested providers                                | No          | Yes (per-instance store)        |
| `sessionStorage` support                        | No          | Yes                             |
| `cookie` storage (zero-flash SSR)               | No          | Yes                             |
| `hybrid` storage (SSR + cross-tab sync)         | No          | Yes                             |
| Disable storage                                 | No          | Yes (`storage="none"`)          |
| `meta theme-color` support                      | No          | Yes (`themeColor` prop)         |
| Server-provided theme                           | No          | Yes (`initialTheme` prop)       |
| `disableTransitionOnChange` per property        | No          | Yes (pass a CSS string)         |
| Read theme outside React                        | No          | Yes (`getTheme()` helper)       |
| Generic types                                   | No          | Yes (`useTheme<AppTheme>()`)    |
| Typed factory                                   | No          | Yes (`createThemes(...)`)       |
| Theme-change effect hook                        | No          | Yes (`useThemeEffect(...)`)     |
| Hydration state without mount effects           | No          | Yes (`useHydrated()`)           |
| Framework-neutral SSR bootstrap                 | No          | Yes (`@wrksz/themes/script`)    |
| View Transitions on theme switch                | No          | Yes (`enableViewTransition`)   |
| Zero runtime dependencies                       | Yes         | Yes                             |

## Table of Contents

- [Changelog](./CHANGELOG.md)
- [Setup](#setup)
- [Usage](#usage)
- [Zero-flash SSR with cookie storage](#zero-flash-ssr-with-cookie-storage)
- [Security model](#security-model)
- [API](#api)
    - [ThemeProvider](#themeprovider)
    - [Extended provider](#opt-in-extended-provider)
    - [useTheme](#usetheme)
    - [getTheme](#gettheme)
    - [useThemeValue](#usethemevalue)
    - [useThemeEffect](#usethemeeffect)
    - [createThemes](#createthemes)
    - [ThemedImage](#themedimage)
- [Examples](#examples)
- [Import paths](#import-paths)
- [AI agents](#ai-agents)

## Setup

Add the provider to your root layout. Import from `@wrksz/themes/next` for Next.js - this avoids the React 19 inline script warning by using `useServerInsertedHTML`. Add `suppressHydrationWarning` to `<html>` to suppress the expected attribute mismatch when the bootstrap applies the theme before hydration.

```tsx
// app/layout.tsx
import { ThemeProvider } from "@wrksz/themes/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
```

> **Note:** Use `ThemeProvider` from `@wrksz/themes/next` directly in a server `layout.tsx`. For nested providers inside Client Components, use [`ClientThemeProvider`](#nested-provider-in-a-client-component).

The Next provider is static and compatible with Next.js 16.3 Instant Navigations,
`cacheComponents`, and Partial Prefetching. It does not mutate cookies during prefetches.
Use `getTheme()` only when server-rendered markup must depend on the cookie; under Cache
Components, isolate that request-time read with `Suspense` or opt the route out with
`export const instant = false`.

## Usage

```tsx
"use client";

import { useTheme } from "@wrksz/themes/client";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
			Toggle theme
		</button>
	);
}
```

## Zero-flash SSR with cookie storage

Use `storage="cookie"` with `@wrksz/themes/next` to eliminate theme flash. The static bootstrap reads the cookie synchronously before paint, so the provider remains compatible with Next.js 16.3 App Shells and Partial Prefetching:

```tsx
// app/layout.tsx
import { ThemeProvider } from "@wrksz/themes/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider storage="cookie" defaultTheme="dark" disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
```

For apps using CSS media queries (`@media (prefers-color-scheme: dark)`) alongside CSS class variables, avoid the media query fallback - the library sets the correct class before the first paint. A media query fallback flashes when the system preference differs from the stored theme:

```css
@media (prefers-color-scheme: dark) {
	:root:not(.light) {
		--bg: #09090b;
	}
}
```

Use class-based selectors instead:

```css
:root {
	--bg: #ffffff;
}
:root.dark {
	--bg: #09090b;
}
```

> Cookie storage alone does not support cross-tab theme sync. Use `storage="hybrid"` to combine cookies with cross-tab synchronization, or `localStorage` if you do not need cookies.

## Security model

`@wrksz/themes` injects a small inline script so the correct theme can be applied before
React hydrates. Script config is serialized with script-context escaping, so values such as
`themeColor`, `value`, `themes`, `forcedTheme`, and `initialTheme` cannot break out of the
`<script>` tag via `</script>` payloads.

If your app uses a Content Security Policy, pass a request-scoped `nonce` to `ThemeProvider`
and include the same nonce in your `script-src` policy.

Cookie storage treats cookies as untrusted input: stored values are validated against
`themes` when a theme list is provided, malformed cookie encoding falls back to
`defaultTheme`, and cookie attributes are validated before writes. Releases are published
with npm provenance from GitHub Actions.

## API

### `ThemeProvider`

The canonical prop table lives on the docs site: [ThemeProvider](https://themes.wrksz.dev/docs/api/theme-provider).

```tsx
import { ThemeProvider } from "@wrksz/themes/next";
```

### Opt-in extended provider

The default provider stays intentionally small. Import the extended provider only when you need
same-document synchronization, custom system mappings, or a client-owned `Element`/`ShadowRoot`:

```tsx
import { ThemeProvider } from "@wrksz/themes/next/extended";

<ThemeProvider
	themes={["paper", "midnight"]}
	systemThemeMap={{ light: "paper", dark: "midnight" }}
	enableSameDocumentSync
>
	{children}
</ThemeProvider>;
```

The Next.js extended provider is synchronous and does not read cookies on the
server. It supports the serializable `systemThemeMap` and
`enableSameDocumentSync` props. For a DOM object, use the client-only entry:

```tsx
"use client";

import { ClientThemeProvider } from "@wrksz/themes/client/extended-provider";

<ClientThemeProvider themeRoot={shadowRoot} storage="none" defaultTheme="dark">
	{children}
</ClientThemeProvider>;
```

- `enableSameDocumentSync?: boolean` synchronizes providers with the same storage key.
- `systemThemeMap?: { light: Theme; dark: Theme } | Record<Theme, { light: Theme; dark: Theme }>`
  maps system preferences to custom names or preserves variant families.
- `themeRoot?: Element | ShadowRoot` targets a client-owned element or a ShadowRoot host. Worked example: [Shadow DOM](https://themes.wrksz.dev/docs/examples/shadow-dom).

### `useTheme`

```tsx
const {
	theme, // Current theme - may be "system"
	resolvedTheme, // Actual theme - never "system"
	systemTheme, // System preference: "light" | "dark" | undefined
	forcedTheme, // Forced theme if set
	themes, // Available themes
	setTheme, // Set theme
} = useTheme();
```

Supports generics for full type safety:

```tsx
type AppTheme = "light" | "dark" | "high-contrast";

const { theme, setTheme } = useTheme<AppTheme>();
// theme: AppTheme | "system" | undefined
// setTheme: (theme: AppTheme | "system") => void
```

### `getTheme`

Reads the current theme from a cookie outside React. Available in `@wrksz/themes/next`.

```ts
// proxy.ts - sync, reads from Request
import { getTheme } from "@wrksz/themes/next";

export function proxy(request: Request) {
  const theme = getTheme(request, { defaultTheme: "dark" });
}

// layout.tsx - async, reads via cookies() from next/headers
const theme = await getTheme({ defaultTheme: "dark" });
return <html className={theme}>...</html>;
```

Pass `themes` as a readonly tuple to infer the return type:

```ts
const theme = getTheme(request, {
	themes: ["light", "dark", "high-contrast"] as const,
	defaultTheme: "light",
});
// theme: "light" | "dark" | "high-contrast"
```

See the [`getTheme` reference](https://themes.wrksz.dev/docs/api/get-theme) for options and server-rendering examples.

### `useThemeValue`

Returns the value from a map matching the current resolved theme. Returns `undefined` before the theme resolves on the client.

```tsx
"use client";
import { useThemeValue } from "@wrksz/themes/client";

const label = useThemeValue({ light: "Switch to dark", dark: "Switch to light" });
const bg = useThemeValue({ light: "#ffffff", dark: "#0a0a0a" });
const icon = useThemeValue({ light: <SunIcon />, dark: <MoonIcon /> });
```

### `useThemeEffect`

Runs an effect after mount whenever the theme changes:

```tsx
"use client";
import { useThemeEffect } from "@wrksz/themes/client";

useThemeEffect((theme, resolvedTheme) => {
	trackThemeChange(theme, resolvedTheme);
});
```

### `createThemes`

Create a typed theme module once and reuse it everywhere:

```tsx
"use client";
import { createThemes } from "@wrksz/themes/client";

export const { ThemeProvider, useTheme, useThemeValue, useThemeEffect } = createThemes({
	themes: ["light", "dark", "high-contrast"] as const,
	storage: "hybrid",
	defaultTheme: "system",
	attribute: "class",
});
```

For a Next.js root layout, import from `@wrksz/themes/next/create-themes` and use `NextThemeProvider` so the theme tuple is not copied into `@wrksz/themes/next`. Full API: [createThemes](https://themes.wrksz.dev/docs/api/create-themes).

### `ThemedImage`

Shows different images per theme. Renders a transparent placeholder on the server to avoid hydration mismatches.

```tsx
import { ThemedImage } from "@wrksz/themes/client";

<ThemedImage
	src={{ light: "/logo-light.png", dark: "/logo-dark.png" }}
	alt="Logo"
	width={200}
	height={50}
/>;
```

## Examples

### Custom themes

```tsx
<ThemeProvider themes={["light", "dark", "high-contrast"]}>{children}</ThemeProvider>
```

### Data attribute instead of class

```tsx
<ThemeProvider attribute="data-theme">{children}</ThemeProvider>
```

```css
[data-theme="dark"] {
	--bg: #000;
}
[data-theme="light"] {
	--bg: #fff;
}
```

### Multiple classes per theme

```tsx
<ThemeProvider
	themes={["light", "dark", "dim"]}
	value={{ light: "light", dark: "dark high-contrast", dim: "dark dim" }}
>
	{children}
</ThemeProvider>
```

Switching away from `"dark"` correctly removes both `dark` and `high-contrast`.

### Forced theme per page

```tsx
// app/dashboard/layout.tsx
<ThemeProvider forcedTheme="dark">{children}</ThemeProvider>
```

### Scoped theming

Apply the theme to a specific element instead of `<html>`, so different sections can have independent themes simultaneously:

```tsx
<ThemeProvider forcedTheme="dark" target="#landing-root" storage="none">
	<div id="landing-root">{children}</div>
</ThemeProvider>
```

```css
#landing-root {
	--bg: #0a0a0a;
	--fg: #fafafa;
}
```

### Server-provided theme

Use `initialTheme` to initialize from a server-side source such as a database or session. It takes precedence over storage at mount; later prop changes do not reinitialize the provider:

```tsx
export default async function RootLayout({ children }) {
	const userTheme = await getUserTheme();

	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider initialTheme={userTheme ?? undefined}>{children}</ThemeProvider>
			</body>
		</html>
	);
}
```

### Nested provider in a Client Component

```tsx
"use client";
import { ClientThemeProvider } from "@wrksz/themes/client";

export function AdminShell({ children }: { children: React.ReactNode }) {
	return <ClientThemeProvider forcedTheme="dark">{children}</ClientThemeProvider>;
}
```

### Suppress transitions on theme change

```tsx
// Disable all transitions
<ThemeProvider disableTransitionOnChange>
  {children}
</ThemeProvider>

// Suppress only color properties, keep transform/opacity transitions intact
<ThemeProvider disableTransitionOnChange="background-color 0s, color 0s, border-color 0s">
  {children}
</ThemeProvider>
```

## Import paths

The convenience client barrel remains available:

```tsx
import { useTheme, useThemeValue, ThemedImage } from "@wrksz/themes/client";
```

Fine-grained client subpaths are also available for consumers who prefer direct public modules:

```tsx
import { useTheme } from "@wrksz/themes/client/use-theme";
import { useThemeValue } from "@wrksz/themes/client/use-theme-value";
import { useThemeEffect } from "@wrksz/themes/client/use-theme-effect";
import { useHydrated } from "@wrksz/themes/client/use-hydrated";
import { ThemedImage } from "@wrksz/themes/client/themed-image";
import { ClientThemeProvider } from "@wrksz/themes/client/provider";
import { ClientThemeProvider as ExtendedClientThemeProvider } from "@wrksz/themes/client/extended-provider";
import { createThemes } from "@wrksz/themes/client/create-themes";
import { createThemes as createNextThemes } from "@wrksz/themes/next/create-themes";
```

| Import                                   | Use for                                                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `@wrksz/themes/next`                     | `ThemeProvider`, `getTheme` in Next.js (recommended)                                                |
| `@wrksz/themes/client`                   | `useTheme`, `useThemeValue`, `useThemeEffect`, `createThemes`, `ThemedImage`, `ClientThemeProvider` |
| `@wrksz/themes/client/use-theme`         | Direct `useTheme` import                                                                            |
| `@wrksz/themes/client/use-theme-value`   | Direct `useThemeValue` import                                                                       |
| `@wrksz/themes/client/use-theme-effect`  | Direct `useThemeEffect` import                                                                      |
| `@wrksz/themes/client/use-hydrated`      | Direct `useHydrated` import                                                                         |
| `@wrksz/themes/client/themed-image`      | Direct `ThemedImage` import                                                                         |
| `@wrksz/themes/client/provider`          | Direct `ClientThemeProvider` import                                                                 |
| `@wrksz/themes/client/extended-provider` | Opt-in `ClientThemeProvider` with synchronization, mapping, and ShadowRoot support                  |
| `@wrksz/themes/client/create-themes`     | Direct `createThemes` import                                                                        |
| `@wrksz/themes/next/create-themes`       | Typed factory that also returns `NextThemeProvider` and `ThemeScript`                               |
| `@wrksz/themes/next/extended`            | Opt-in Next.js `ThemeProvider` with synchronization and system mapping                              |
| `@wrksz/themes`                          | Client-safe `ThemeProvider` alias and `createThemes` for framework-neutral React usage              |
| `@wrksz/themes/script`                   | Server-safe `ThemeScript` for non-Next SSR frameworks                                               |

## AI agents

The npm package includes [AGENTS.md](./packages/themes/AGENTS.md) with import guidance and migration checks. The [agent guide](https://themes.wrksz.dev/docs/agents) adds examples and troubleshooting, with a [plain Markdown version](https://themes.wrksz.dev/llms.mdx/docs/agents) and a [documentation index](https://themes.wrksz.dev/llms.txt).

Ask your agent to read `node_modules/@wrksz/themes/AGENTS.md` or the guide URL. Some agents skip instructions inside dependencies.

## License

MIT

[![Sponsored by Hoxger](./.github/images/sponsor.jpg)](https://hoxger.com)
