<img src=".github/images/banner.png" alt="@wrksz/themes" width="100%" />

# @wrksz/themes

[![npm version](https://img.shields.io/npm/v/@wrksz/themes)](https://www.npmjs.com/package/@wrksz/themes)

Modern theme management for Next.js 16+ and React 19+. Drop-in replacement for `next-themes` - fixes every known bug and adds missing features.

```bash
bun add @wrksz/themes
# or
npm install @wrksz/themes
```

## Setup

Add the provider to your root layout. Add `suppressHydrationWarning` to `<html>` to prevent hydration warnings caused by the inline theme script running before React hydrates.

```tsx
// app/layout.tsx
import { ThemeProvider } from "@wrksz/themes";

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

## Usage

```tsx
"use client";

import { useTheme } from "@wrksz/themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Toggle theme
    </button>
  );
}
```

## API

### `ThemeProvider`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `themes` | `string[]` | `["light", "dark"]` | Available themes |
| `defaultTheme` | `string` | `"system"` | Theme used when no preference is stored |
| `forcedTheme` | `string` | - | Force a specific theme, ignoring user preference |
| `initialTheme` | `string` | - | Server-provided theme that overrides storage on mount. User can still call `setTheme` to change it |
| `enableSystem` | `boolean` | `true` | Detect system preference via `prefers-color-scheme` |
| `enableColorScheme` | `boolean` | `true` | Set native `color-scheme` CSS property |
| `attribute` | `string \| string[]` | `"class"` | HTML attribute(s) to set on target element (`"class"`, `"data-theme"`, etc.) |
| `value` | `Record<string, string>` | - | Map theme names to attribute values |
| `target` | `string` | `"html"` | Element to apply theme to (`"html"`, `"body"`, or a CSS selector) |
| `storageKey` | `string` | `"theme"` | Key used for storage |
| `storage` | `"localStorage" \| "sessionStorage" \| "none"` | `"localStorage"` | Where to persist the theme |
| `disableTransitionOnChange` | `boolean` | `false` | Disable CSS transitions when switching themes |
| `followSystem` | `boolean` | `false` | Always follow system preference changes, even after `setTheme` was called |
| `themeColor` | `string \| Record<string, string>` | - | Update `<meta name="theme-color">` on theme change |
| `nonce` | `string` | - | CSP nonce for the inline script |
| `onThemeChange` | `(theme: string) => void` | - | Called whenever the resolved theme changes |

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

## Examples

### Custom themes with Tailwind

```tsx
<ThemeProvider
  themes={["light", "dark", "high-contrast"]}
  attribute="class"
>
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

### Custom attribute values

```tsx
<ThemeProvider
  themes={["light", "dark"]}
  attribute="data-mode"
  value={{ light: "light-mode", dark: "dark-mode" }}
>
  {children}
</ThemeProvider>
```

### Multiple classes per theme

Map a theme to multiple CSS classes by using a space-separated value:

```tsx
<ThemeProvider
  themes={["light", "dark", "dim"]}
  value={{ light: "light", dark: "dark high-contrast", dim: "dark dim" }}
>
  {children}
</ThemeProvider>
```

### Meta theme-color (Safari / PWA)

```tsx
<ThemeProvider themeColor={{ light: "#ffffff", dark: "#0a0a0a" }}>
  {children}
</ThemeProvider>
```

Works with CSS variables too:

```tsx
<ThemeProvider themeColor="var(--color-background)">
  {children}
</ThemeProvider>
```

### Disable storage

```tsx
// No persistence - always uses defaultTheme or system preference
<ThemeProvider storage="none" defaultTheme="dark">
  {children}
</ThemeProvider>
```

### Forced theme per page

```tsx
// app/dashboard/layout.tsx
<ThemeProvider forcedTheme="dark">
  {children}
</ThemeProvider>
```

### Different theme per section (scoped theming)

Apply the theme to a specific element instead of `<html>` using the `target` prop. This lets different sections of your app have independent themes simultaneously.

```tsx
// app/landing/layout.tsx
export default function LandingLayout({ children }) {
  return (
    <ThemeProvider forcedTheme="dark" target="#landing-root" storage="none">
      <div id="landing-root">{children}</div>
    </ThemeProvider>
  );
}

// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <ThemeProvider forcedTheme="light" target="#dashboard-root" storage="none">
      <div id="dashboard-root">{children}</div>
    </ThemeProvider>
  );
}
```

```css
/* scope your CSS variables to the target element */
#landing-root { --bg: #0a0a0a; --fg: #fafafa; }
#dashboard-root { --bg: #ffffff; --fg: #0a0a0a; }
```

Use `storage="none"` when the theme is forced - there's nothing to persist.

### Server-provided theme

Use `initialTheme` to initialize from a server-side source (database, session, cookie) on every mount, overriding any locally stored value. The user can still call `setTheme` to change it - use `onThemeChange` to persist the change back.

```tsx
// app/layout.tsx (server component)
export default async function RootLayout({ children }) {
  const userTheme = await getUserTheme(); // "light" | "dark" | null

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          initialTheme={userTheme ?? undefined}
          onThemeChange={saveUserTheme}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Nested provider in a Client Component

`ThemeProvider` renders an inline `<script>` and must be used in a Server Component. For nested providers inside Client Components, use `ClientThemeProvider` instead:

```tsx
"use client";

import { ClientThemeProvider } from "@wrksz/themes";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ClientThemeProvider forcedTheme="dark">
      {children}
    </ClientThemeProvider>
  );
}
```

### `useThemeValue`

Returns the value from a map that matches the current resolved theme. Returns `undefined` before the theme resolves on the client.

```tsx
"use client";

import { useThemeValue } from "@wrksz/themes";

// strings
const label = useThemeValue({ light: "Switch to dark", dark: "Switch to light" });

// CSS values
const bg = useThemeValue({ light: "#ffffff", dark: "#0a0a0a", purple: "#6633ff" });

// any type
const icon = useThemeValue({ light: <SunIcon />, dark: <MoonIcon /> });
```

### Theme-aware images

Showing different images per theme has a hydration mismatch problem - `resolvedTheme` is always `undefined` on the server. Use the built-in `ThemedImage` component which shows a transparent placeholder until the theme resolves on the client:

```tsx
import { ThemedImage } from "@wrksz/themes";

<ThemedImage
  src={{ light: "/logo-light.png", dark: "/logo-dark.png" }}
  alt="Logo"
  width={200}
  height={50}
/>
```

Works with any custom themes too:

```tsx
<ThemedImage
  src={{
    light: "/logo-light.png",
    dark: "/logo-dark.png",
    purple: "/logo-purple.png",
  }}
  alt="Logo"
  width={200}
  height={50}
/>
```

For custom themes or `next/image`, use `resolvedTheme` directly with a fallback:

```tsx
"use client";

import Image from "next/image";
import { useTheme } from "@wrksz/themes";

export function Logo() {
  const { resolvedTheme } = useTheme();

  return (
    <Image
      src={resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
      alt="Logo"
      width={200}
      height={50}
      // avoids layout shift while theme is resolving
      style={{ visibility: resolvedTheme ? "visible" : "hidden" }}
    />
  );
}
```

### Class on body instead of html

```tsx
<ThemeProvider target="body">
  {children}
</ThemeProvider>
```

## Why not `next-themes`?

| Issue | next-themes | @wrksz/themes |
|-------|-------------|---------------|
| React 19 script warning | Yes | Fixed (RSC split) |
| `__name` minification bug | Yes | Fixed |
| React 19 Activity/cacheComponents stale theme | Yes | Fixed (`useSyncExternalStore`) |
| Multiple classes per theme | No | Yes (`value` map with spaces) |
| Nested providers | No | Yes (per-instance store) |
| `sessionStorage` support | No | Yes |
| Disable storage | No | Yes (`storage: "none"`) |
| `meta theme-color` support | No | Yes (`themeColor` prop) |
| Server-provided theme | No | Yes (`initialTheme` prop) |
| Generic types | No | Yes (`useTheme<AppTheme>()`) |
| Zero runtime dependencies | Yes | Yes |

## License

MIT
