# @wrksz/themes

Theme management for React and Next.js. Supports light, dark and custom themes, system preferences, and persistent selection. No runtime dependencies.

[Documentation](https://themes.wrksz.dev) · [npm](https://www.npmjs.com/package/@wrksz/themes) · [GitHub](https://github.com/jakubwarkusz/themes)

## Install

```sh
pnpm add @wrksz/themes
# or
npm install @wrksz/themes
```

Requires React and React DOM 18 or 19. The Next.js integration requires Next.js 16+. TypeScript users need 5.9 or newer.

## Next.js setup

Add the provider directly to your server layout:

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import { ThemeProvider } from "@wrksz/themes/next";

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
```

By default, the provider applies a `light` or `dark` class to `<html>`, follows the system preference until the user chooses a theme, and saves that choice in `localStorage`. Its inline script applies the theme before hydration. `suppressHydrationWarning` handles the resulting attribute difference on `<html>`.

Add theme styles in your global CSS:

```css
:root {
	color: #18181b;
	background: #fff;
}

:root.dark {
	color: #fafafa;
	background: #18181b;
}
```

Use the client entry for a theme toggle:

```tsx
"use client";

import { useTheme } from "@wrksz/themes/client";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<button
			type="button"
			disabled={!resolvedTheme}
			onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
		>
			Toggle theme
		</button>
	);
}
```

For React apps outside Next.js, use `ClientThemeProvider` from `@wrksz/themes/client`. Other SSR frameworks can pair it with `ThemeScript` from `@wrksz/themes/script`. See [framework setup](https://themes.wrksz.dev/docs/examples/framework-agnostic).

## Configuration

- Choose `localStorage`, `sessionStorage`, `cookie`, `hybrid`, or no storage. [Hybrid storage](https://themes.wrksz.dev/docs/examples/hybrid-storage) combines cookies with cross-tab synchronization.
- Apply custom theme names, classes, or [data attributes](https://themes.wrksz.dev/docs/examples/data-attribute). Use [scoped providers](https://themes.wrksz.dev/docs/examples/scoped-theming) to theme individual sections.
- Use [`createThemes`](https://themes.wrksz.dev/docs/api/create-themes) to share typed configuration and hooks.
- Import the [extended provider](https://themes.wrksz.dev/docs/api/theme-provider) for same-document synchronization and custom system mappings. The extended client provider also supports [Shadow DOM](https://themes.wrksz.dev/docs/examples/shadow-dom).

The Next.js provider does not read cookies on the server. If server-rendered content needs the stored theme, read it explicitly with [`getTheme`](https://themes.wrksz.dev/docs/api/get-theme) and pass `initialTheme`. Next.js imports that helper from `@wrksz/themes/next`. Other servers import `getTheme` and `parseThemeCookie` from `@wrksz/themes/server`. See the [server theme example](https://themes.wrksz.dev/docs/examples/server-theme).

Full props and hooks are documented in the [API reference](https://themes.wrksz.dev/docs/api/theme-provider).

## Migration

Version 2 changes cookie handling, forced-theme persistence, and initialization behavior. Read [Upgrading from 1.x](https://themes.wrksz.dev/docs/migration#upgrading-from-1x) before upgrading. The same page covers migration from `next-themes`.

## AI agents

Ask your agent to read [AGENTS.md](./AGENTS.md) in the installed package. It covers imports and migration checks. For examples and troubleshooting, use the [agent guide](https://themes.wrksz.dev/docs/agents) or [documentation index](https://themes.wrksz.dev/llms.txt).

## License

MIT
