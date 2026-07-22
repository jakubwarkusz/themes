import * as root from "@wrksz/themes";
import * as client from "@wrksz/themes/client";
import * as createThemes from "@wrksz/themes/client/create-themes";
import * as provider from "@wrksz/themes/client/provider";
import * as themedImage from "@wrksz/themes/client/themed-image";
import * as useHydrated from "@wrksz/themes/client/use-hydrated";
import * as useTheme from "@wrksz/themes/client/use-theme";
import * as useThemeEffect from "@wrksz/themes/client/use-theme-effect";
import * as useThemeValue from "@wrksz/themes/client/use-theme-value";
import * as next from "@wrksz/themes/next";
import * as script from "@wrksz/themes/script";

const entrypoints = [
	[".", root, ["ThemeProvider", "createThemes"]],
	["./client", client, ["ClientThemeProvider", "useTheme"]],
	["./client/create-themes", createThemes, ["createThemes"]],
	["./client/provider", provider, ["ClientThemeProvider"]],
	["./client/themed-image", themedImage, ["ThemedImage"]],
	["./client/use-hydrated", useHydrated, ["useHydrated"]],
	["./client/use-theme", useTheme, ["ThemeContext", "useTheme"]],
	["./client/use-theme-effect", useThemeEffect, ["useThemeEffect"]],
	["./client/use-theme-value", useThemeValue, ["useThemeValue"]],
	["./next", next, ["ThemeProvider", "getTheme"]],
	["./script", script, ["ThemeScript"]],
] as const;

for (const [subpath, module, expectedExports] of entrypoints) {
	for (const exportName of expectedExports) {
		if (!(exportName in module)) {
			throw new Error(
				`Missing ${exportName} export from @wrksz/themes${subpath === "." ? "" : subpath}`,
			);
		}
	}
}
