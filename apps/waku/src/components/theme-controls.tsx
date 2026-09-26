"use client";

import { useTheme } from "@wrksz/themes/client";

export function ThemeControls() {
	const { theme, setTheme } = useTheme();

	return (
		<section>
			<p>
				Theme: <output data-testid="theme-value">{theme ?? "loading"}</output>
			</p>
			<button type="button" onClick={() => setTheme("dark")}>
				Use dark
			</button>
			<button type="button" onClick={() => setTheme("light")}>
				Use light
			</button>
		</section>
	);
}
