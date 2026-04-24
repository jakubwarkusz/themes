

# @wrksz/themes

[![npm version](https://img.shields.io/npm/v/@wrksz/themes)](https://www.npmjs.com/package/@wrksz/themes)
[![docs](https://img.shields.io/badge/docs-themes.wrksz.dev-7c3aed)](https://themes.wrksz.dev)

Modern theme management for Next.js 16+ and React 19+. Near drop-in replacement for `next-themes` - fixes every known bug and adds missing features. Migrating requires changing one import line.

```bash
bun add @wrksz/themes
# or
npm install @wrksz/themes
```

## What's new in v0.9.0

- `storage="hybrid"`: cookie-first read for SSR + `localStorage` mirror for cross-tab sync.
- `createThemes(...)`: typed factory for provider and hooks from one canonical tuple.
- `useThemeEffect(...)`: side effects on theme changes after initial render.

## Why not `next-themes`?


|                                                 | next-themes | @wrksz/themes             |
| ----------------------------------------------- | ----------- | ------------------------- |
| React 19 script warning                         | ❌           | ✅ `useServerInsertedHTML` |
| `__name` minification bug                       | ❌           | ✅                         |
| Stale theme with React 19 `cacheComponents`     | ❌           | ✅ `useSyncExternalStore`  |
| Multi-class theme removal leaving stale classes | ❌           | ✅                         |
| Nested providers                                | ❌           | ✅ per-instance store      |
| `sessionStorage` support                        | ❌           | ✅                         |
| `cookie` storage (zero-flash SSR)               | ❌           | ✅                         |
| `hybrid` storage (SSR + cross-tab sync)         | ❌           | ✅                         |
| Disable storage                                 | ❌           | ✅ `storage="none"`        |
| `meta theme-color` support                      | ❌           | ✅ `themeColor` prop       |
| Server-provided theme                           | ❌           | ✅ `initialTheme` prop     |
| `disableTransitionOnChange` per property        | ❌           | ✅ pass a CSS string       |
| Read theme outside React                        | ❌           | ✅ `getTheme()` helper     |
| Generic types                                   | ❌           | ✅ `useTheme<AppTheme>()`  |
| Typed factory                                   | ❌           | ✅ `createThemes(...)`     |
| Theme-change effect hook                        | ❌           | ✅ `useThemeEffect(...)`   |
| Zero runtime dependencies                       | ✅           | ✅                         |


## Table of Contents

- [Setup](#setup)
- [Usage](#usage)
- [Zero-flash SSR with cookie storage](#zero-flash-ssr-with-cookie-storage)
- [API](#api)
  - [ThemeProvider](#themeprovider)
  - [useTheme](#usetheme)
  - [getTheme](#gettheme)
  - [useThemeValue](#usethemevalue)
  - [ThemedImage](#themedimage)
- [Examples](#examples)
- [Import paths](#import-paths)

## Setup

Add the provider to your root layout. Import from `@wrksz/themes/next` for Next.js - this avoids the React 19 inline script warning by using `useServerInsertedHTML`. Add `suppressHydrationWarning` to `<html>` to prevent hydration mismatches.

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

> **Note:** `ThemeProvider` from `@wrksz/themes/next` is an async Server Component. Use it directly in `layout.tsx` - it cannot be wrapped in a `"use client"` component. For nested providers inside Client Components, use `[ClientThemeProvider](#nested-provider-in-a-client-component)`.

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

Use `storage="cookie"` with `@wrksz/themes/next` to eliminate SSR theme flash. The provider reads the cookie server-side automatically - no boilerplate required:

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

For apps using CSS media queries (`@media (prefers-color-scheme: dark)`) alongside CSS class variables, avoid the media query fallback - the library sets the correct class before the first paint:

```css
/* ❌ causes flash when system pref differs from stored theme */
@media (prefers-color-scheme: dark) {
  :root:not(.light) { --bg: #09090b; }
}

/* ✅ */
:root      { --bg: #ffffff; }
:root.dark { --bg: #09090b; }
```

> Cookie storage does not support cross-tab theme sync. Use `localStorage` with `initialTheme` if you need it.

## API

### `ThemeProvider`


| Prop                        | Type                                                               | Default             | Description                                                                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `themes`                    | `string[]`                                                         | `["light", "dark"]` | Available themes                                                                                                                                                                                                                   |
| `defaultTheme`              | `string`                                                           | `"system"`          | Theme used when no preference is stored                                                                                                                                                                                            |
| `forcedTheme`               | `string`                                                           | -                   | Force a specific theme, ignoring user preference                                                                                                                                                                                   |
| `initialTheme`              | `string`                                                           | -                   | Server-provided theme that overrides storage on mount. User can still call `setTheme` to change it                                                                                                                                 |
| `enableSystem`              | `boolean`                                                          | `true`              | Detect system preference via `prefers-color-scheme`                                                                                                                                                                                |
| `enableColorScheme`         | `boolean`                                                          | `true`              | Set native `color-scheme` CSS property                                                                                                                                                                                             |
| `attribute`                 | `string | string[]`                                                | `"class"`           | HTML attribute(s) to set on target element (`"class"`, `"data-theme"`, etc.)                                                                                                                                                       |
| `value`                     | `Record<string, string>`                                           | -                   | Map theme names to attribute values                                                                                                                                                                                                |
| `target`                    | `string`                                                           | `"html"`            | Element to apply theme to (`"html"`, `"body"`, or a CSS selector)                                                                                                                                                                  |
| `storageKey`                | `string`                                                           | `"theme"`           | Key used for storage                                                                                                                                                                                                               |
| `storage`                   | `"localStorage" | "sessionStorage" | "cookie" | "hybrid" | "none"` | `"localStorage"`    | Where to persist the theme. `"hybrid"` reads from cookie first and mirrors to `localStorage` for cross-tab sync. `"cookie"` reads/writes `document.cookie` and with `@wrksz/themes/next` also reads server-side for zero-flash SSR |
| `disableTransitionOnChange` | `boolean | string`                                                 | `false`             | Suppress CSS transitions when switching themes. `true` disables all. Pass a CSS `transition` value (e.g. `"background-color 0s, color 0s"`) to suppress only specific properties                                                   |
| `followSystem`              | `boolean`                                                          | `false`             | Always follow system preference, ignores stored value on mount                                                                                                                                                                     |
| `themeColor`                | `string | Record<string, string>`                                  | -                   | Update `<meta name="theme-color">` on theme change                                                                                                                                                                                 |
| `nonce`                     | `string`                                                           | -                   | CSP nonce for the inline script                                                                                                                                                                                                    |
| `onThemeChange`             | `(theme: string) => void`                                          | -                   | Called when theme changes. Receives the selected value (may be `"system"`). When system preference changes while theme is `"system"`, fires with the resolved value                                                                |


### `useTheme`

```tsx
const {
  theme,         // Current theme - may be "system"
  resolvedTheme, // Actual theme - never "system"
  systemTheme,   // System preference: "light" | "dark" | undefined
  forcedTheme,   // Forced theme if set
  themes,        // Available themes
  setTheme,      // Set theme
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


| Option         | Type       | Default    | Description                                                              |
| -------------- | ---------- | ---------- | ------------------------------------------------------------------------ |
| `storageKey`   | `string`   | `"theme"`  | Cookie name to read from                                                 |
| `defaultTheme` | `string`   | `"system"` | Returned when no valid theme is found                                    |
| `themes`       | `string[]` | -          | When provided, stored values not in the list fall back to `defaultTheme` |


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

### `ThemedImage`

Shows different images per theme. Renders a transparent placeholder on the server to avoid hydration mismatches.

```tsx
import { ThemedImage } from "@wrksz/themes/client";

<ThemedImage
  src={{ light: "/logo-light.png", dark: "/logo-dark.png" }}
  alt="Logo"
  width={200}
  height={50}
/>
```

## Examples

### Custom themes

```tsx
<ThemeProvider themes={["light", "dark", "high-contrast"]}>
  {children}
</ThemeProvider>
```

### Data attribute instead of class

```tsx
<ThemeProvider attribute="data-theme">
  {children}
</ThemeProvider>
```

```css
[data-theme="dark"] { --bg: #000; }
[data-theme="light"] { --bg: #fff; }
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
<ThemeProvider forcedTheme="dark">
  {children}
</ThemeProvider>
```

### Scoped theming

Apply the theme to a specific element instead of `<html>`, so different sections can have independent themes simultaneously:

```tsx
<ThemeProvider forcedTheme="dark" target="#landing-root" storage="none">
  <div id="landing-root">{children}</div>
</ThemeProvider>
```

```css
#landing-root { --bg: #0a0a0a; --fg: #fafafa; }
```

### Server-provided theme

Initialize from a server-side source (database, session) - overrides stored value on every mount:

```tsx
export default async function RootLayout({ children }) {
  const userTheme = await getUserTheme();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider initialTheme={userTheme ?? undefined} onThemeChange={saveUserTheme}>
          {children}
        </ThemeProvider>
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
  return (
    <ClientThemeProvider forcedTheme="dark">
      {children}
    </ClientThemeProvider>
  );
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


| Import                 | Use for                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `@wrksz/themes/next`   | `ThemeProvider`, `getTheme` in Next.js (recommended)                                                |
| `@wrksz/themes/client` | `useTheme`, `useThemeValue`, `useThemeEffect`, `createThemes`, `ThemedImage`, `ClientThemeProvider` |
| `@wrksz/themes`        | `ThemeProvider`, `createThemes` for non-Next.js frameworks                                          |


## License

MIT