# Using @wrksz/themes 2.x

Check package.json and dist/*.d.ts in the installed package; online docs may describe a newer release. Requires React/React DOM 18 or 19, Next.js 16+ for Next entries, TypeScript 5.9+.

## Imports

- Next App Router server layout: ThemeProvider from @wrksz/themes/next. It injects the bootstrap; it does not read server cookies.
- Client hooks and nested/client-only providers: @wrksz/themes/client. Use /next only in server modules because it also exports server-only getTheme.
- Typed Next configuration: createThemes from /next/create-themes in one module marked "use client". Export NextThemeProvider and its hooks from that module. Each factory has its own context; import its provider and hooks from the same module.
- Other React SSR: pair ThemeScript from /script with ClientThemeProvider from /client, with matching configuration. A client-only provider does not inject the bootstrap.
- /next/extended adds systemThemeMap and enableSameDocumentSync. /client/extended-provider also accepts themeRoot (Element or ShadowRoot). These props are not on the default provider or factory.

## Defaults and pitfalls

Defaults: attribute="class", storage="localStorage", storageKey="theme", themes=["light","dark"], enableSystem=true. Add suppressHydrationWarning to html for bootstrap attribute changes; it does not fix mismatched child markup.

- theme/resolvedTheme can be undefined before hydration. Keep initial server/client UI equal. useHydrated can gate theme-dependent UI. Disable theme switching when forcedTheme is set.
- theme may be "system"; resolvedTheme is the actual name. setTheme accepts configured names and "system" when enabled. themes does not append "system" automatically.
- initialTheme sets the selection at mount. Use setTheme for later changes. Changing initialTheme/storageKey does not rerun initialization. forcedTheme overrides selection without persisting it.
- Cookie-only storage has no cross-tab sync; hybrid mirrors writes to localStorage. getTheme reads cookies, not browser storage, and may return "system". Do not put unresolved "system" into an html class. Server cookie reads require request-time rendering.
- Props passed from server to client components must be serializable. Put onThemeChange/onStorageError callbacks in client code. Scope independent providers to separate DOM targets and storage keys.

## Migrating from next-themes

Preserve themes, value, storageKey and CSS selectors. next-themes defaults to data-theme; explicitly set attribute="data-theme" to retain that behavior. Move the Next root provider to the server layout, but keep unrelated providers in their existing client wrapper. Change client hook imports to /client. Keep storageKey and localStorage to retain saved preferences; do not clear storage. Check custom theme names and the system menu option. Remove next-themes only after its imports are gone.

## Documentation

Patterns, errors and verification: https://themes.wrksz.dev/llms.mdx/docs/agents
Migration: https://themes.wrksz.dev/llms.mdx/docs/migration
Documentation index: https://themes.wrksz.dev/llms.txt
Human-readable guide: https://themes.wrksz.dev/docs/agents

Type-check and build the app after integration. Check cold load, hydration, reload, system changes, forced/scoped themes and back/forward navigation. Test cross-tab sync only for localStorage/hybrid.
