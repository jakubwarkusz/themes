export const PUBLIC_BUILD_ENTRIES: readonly string[] = [
	"src/index.ts",
	"src/client.ts",
	"src/client/use-theme.ts",
	"src/client/use-theme-value.ts",
	"src/client/use-theme-effect.ts",
	"src/client/use-hydrated.ts",
	"src/client/themed-image.ts",
	"src/client/provider.ts",
	"src/client/create-themes.ts",
	"src/next.ts",
	"src/script.ts",
];

export const INTERNAL_RUNTIME_BUILD_ENTRIES: readonly string[] = [
	"src/providers/client-next-provider.tsx",
];

export const RUNTIME_BUILD_ENTRIES: readonly string[] = [
	...PUBLIC_BUILD_ENTRIES,
	...INTERNAL_RUNTIME_BUILD_ENTRIES,
];

export const DECLARATION_BUILD_ENTRIES: readonly string[] = PUBLIC_BUILD_ENTRIES;
