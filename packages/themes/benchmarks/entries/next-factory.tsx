import { type CreateNextThemesResult, createThemes } from "@wrksz/themes/next/create-themes";
import type { ReactElement } from "react";

const bindings: CreateNextThemesResult<readonly ["light", "dark"]> = createThemes({
	themes: ["light", "dark"] as const,
});

export function NextFactoryFixture(
	props: Parameters<typeof bindings.NextThemeProvider>[0],
): ReactElement {
	return <bindings.NextThemeProvider {...props} />;
}

export function useFactoryTheme(): ReturnType<typeof bindings.useTheme> {
	return bindings.useTheme();
}
