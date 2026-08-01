import type { ReactElement } from "react";
import { useTheme } from "@wrksz/themes/client";

export function UseThemeFixture(): ReactElement {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
			{resolvedTheme}
		</button>
	);
}
