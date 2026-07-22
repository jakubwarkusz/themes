import type { ReactElement } from "react";
import { useThemeValue } from "@wrksz/themes/client";

export function UseThemeValueFixture(): ReactElement {
	const label = useThemeValue({
		light: "Switch to dark",
		dark: "Switch to light",
	});

	return <span>{label}</span>;
}
