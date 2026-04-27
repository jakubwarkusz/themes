import { useTheme } from "@wrksz/themes/client";

export function UseThemeFixture() {
	const { resolvedTheme, setTheme } = useTheme();

	return (
		<button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
			{resolvedTheme}
		</button>
	);
}
