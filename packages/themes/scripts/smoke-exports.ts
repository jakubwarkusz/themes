import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import * as root from "@wrksz/themes";
import * as client from "@wrksz/themes/client";
import * as createThemes from "@wrksz/themes/client/create-themes";
import * as extendedProvider from "@wrksz/themes/client/extended-provider";
import * as provider from "@wrksz/themes/client/provider";
import * as themedImage from "@wrksz/themes/client/themed-image";
import * as useHydrated from "@wrksz/themes/client/use-hydrated";
import * as useTheme from "@wrksz/themes/client/use-theme";
import * as useThemeEffect from "@wrksz/themes/client/use-theme-effect";
import * as useThemeValue from "@wrksz/themes/client/use-theme-value";
import * as next from "@wrksz/themes/next";
import * as nextCreateThemes from "@wrksz/themes/next/create-themes";
import * as nextExtended from "@wrksz/themes/next/extended";
import * as script from "@wrksz/themes/script";
import * as server from "@wrksz/themes/server";

const entrypoints = [
	[".", root, ["ThemeProvider", "createThemes"]],
	["./client", client, ["ClientThemeProvider", "useTheme"]],
	["./client/create-themes", createThemes, ["createThemes"]],
	["./client/extended-provider", extendedProvider, ["ClientThemeProvider"]],
	["./client/provider", provider, ["ClientThemeProvider"]],
	["./client/themed-image", themedImage, ["ThemedImage"]],
	["./client/use-hydrated", useHydrated, ["useHydrated"]],
	["./client/use-theme", useTheme, ["ThemeContext", "useTheme"]],
	["./client/use-theme-effect", useThemeEffect, ["useThemeEffect"]],
	["./client/use-theme-value", useThemeValue, ["useThemeValue"]],
	["./next", next, ["ThemeProvider", "getTheme"]],
	["./next/create-themes", nextCreateThemes, ["createThemes", "createNextThemes"]],
	["./next/extended", nextExtended, ["ThemeProvider"]],
	["./script", script, ["ThemeScript"]],
	["./server", server, ["getTheme", "parseThemeCookie"]],
] as const;

const packageRoot = resolve(import.meta.dirname, "..");

for (const [subpath, module, expectedExports] of entrypoints) {
	const specifier = `@wrksz/themes${subpath === "." ? "" : subpath.slice(1)}`;
	assert.ok(
		import.meta.resolve(specifier).includes("/dist/"),
		`${specifier} must resolve to the built package, not a TypeScript source alias`,
	);
	for (const exportName of expectedExports) {
		if (!(exportName in module)) {
			throw new Error(
				`Missing ${exportName} export from @wrksz/themes${subpath === "." ? "" : subpath.slice(1)}`,
			);
		}
	}
}

// Module-preserving output must retain the client boundaries used by Next.js.
for (const sourcePath of await readdir(resolve(packageRoot, "src"), { recursive: true })) {
	if (!/\.tsx?$/.test(sourcePath) || sourcePath.includes("__tests__")) continue;
	const source = await readFile(resolve(packageRoot, "src", sourcePath), "utf8");
	if (!source.startsWith('"use client";')) continue;
	const outputPath = sourcePath.replace(/\.tsx?$/, ".js");
	const output = await readFile(resolve(packageRoot, "dist", outputPath), "utf8");
	assert.match(output, /^(["'])use client\1;/, `${outputPath} lost its client directive`);
}

for (const serverEntry of ["next.js", "next/extended.js", "script.js", "server.js"]) {
	const output = await readFile(resolve(packageRoot, "dist", serverEntry), "utf8");
	assert.doesNotMatch(output, /^(["'])use client\1;/, `${serverEntry} became a client entry`);
}

const serverBundle = await readFile(resolve(packageRoot, "dist/server.js"), "utf8");
assert.doesNotMatch(
	serverBundle,
	/next\/headers/,
	"@wrksz/themes/server must not reference next/headers",
);
