import type { ReactElement } from "react";
import { useThemeValue } from "@wrksz/themes/client/use-theme-value";

export function UseThemeValueSubpathFixture(): ReactElement {
	const label = useThemeValue({
		light: "Switch to dark",
		dark: "Switch to light",
	});

	return <span>{label}</span>;
}
