# @wrksz/themes

Modern theme management for Next.js and React. It keeps the `next-themes` style API, adds typed helpers, and fixes React 19 / Next.js App Router edge cases around inline scripts, server themes, cookies, and hydration.

Supports TypeScript 5.9, 6, and 7.

[Docs](https://themes.wrksz.dev) · [GitHub](https://github.com/jakubwarkusz/themes)

```bash
bun add @wrksz/themes
# or
npm install @wrksz/themes
```

## Setup

Use the Next.js entry in `app/layout.tsx`:

```tsx
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

Use client hooks from the client entry:

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

## Highlights

- React 19 friendly Next.js provider using `useServerInsertedHTML`.
- Static provider compatible with Next.js 16.3 App Shells and Partial Prefetching.
- `localStorage`, `sessionStorage`, `cookie`, `hybrid`, and disabled storage modes.
- Zero-flash cookie theming via a synchronous pre-paint bootstrap.
- `initialTheme`, `themeColor`, nested providers, scoped targets, and multi-class theme values.
- Typed `useTheme`, `useThemeValue`, `useThemeEffect`, `ThemedImage`, and `createThemes`.
- Fine-grained client subpath exports for smaller app bundles.
- No runtime dependencies.

## Cookie SSR

```tsx
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

The provider itself does not call `cookies()`, so it remains part of a reusable App Shell.
Use `getTheme()` explicitly when server-rendered markup needs the cookie; with Cache Components,
wrap request-time themed subtrees in `Suspense` or set `export const instant = false`.

## Import Paths

```tsx
import { ThemeProvider, getTheme } from "@wrksz/themes/next";
import {
	ClientThemeProvider,
	ThemedImage,
	createThemes,
	useTheme,
	useThemeEffect,
	useThemeValue,
} from "@wrksz/themes/client";
```

Fine-grained client modules are also available:

```tsx
import { useTheme } from "@wrksz/themes/client/use-theme";
import { useThemeValue } from "@wrksz/themes/client/use-theme-value";
import { useThemeEffect } from "@wrksz/themes/client/use-theme-effect";
import { ThemedImage } from "@wrksz/themes/client/themed-image";
import { ClientThemeProvider } from "@wrksz/themes/client/provider";
import { createThemes } from "@wrksz/themes/client/create-themes";
```

Full API docs and examples live at [themes.wrksz.dev](https://themes.wrksz.dev).

## License

MIT
