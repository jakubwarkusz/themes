import pierreDark from "@pierre/theme/pierre-dark";
import pierreLight from "@pierre/theme/pierre-light";
import type { ThemeRegistration } from "shiki";

function withJsxText(theme: ThemeRegistration): ThemeRegistration {
	return {
		...theme,
		tokenColors: [
			...(theme.tokenColors ?? []),
			{
				scope: ["meta.jsx.children"],
				settings: { foreground: theme.colors?.["editor.foreground"] },
			},
		],
	};
}

export const codeThemes = {
	light: withJsxText(pierreLight as ThemeRegistration),
	dark: withJsxText(pierreDark as ThemeRegistration),
};
