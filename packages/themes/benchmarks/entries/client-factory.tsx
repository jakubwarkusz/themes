import { type CreateThemesResult, createThemes } from "@wrksz/themes/client/create-themes";
import type { ReactElement } from "react";

const bindings: CreateThemesResult<readonly ["light", "dark"]> = createThemes({
	themes: ["light", "dark"] as const,
});

export function ClientFactoryFixture(
	props: Parameters<typeof bindings.ThemeProvider>[0],
): ReactElement {
	return <bindings.ThemeProvider {...props} />;
}

export function useFactoryTheme(): ReturnType<typeof bindings.useTheme> {
	return bindings.useTheme();
}
