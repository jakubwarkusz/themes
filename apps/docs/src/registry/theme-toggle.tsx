"use client";

import { useTheme } from "@wrksz/themes/client";
import { MoonIcon, SunIcon } from "./theme-icons";

const SWAP =
	"absolute size-4 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const dark = resolvedTheme === "dark";

	return (
		<button
			type="button"
			onClick={() => setTheme(dark ? "light" : "dark")}
			aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
			className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96]"
		>
			<SunIcon className={`${SWAP} dark:scale-50 dark:opacity-0 dark:blur-[2px]`} />
			<MoonIcon
				className={`${SWAP} scale-50 opacity-0 blur-[2px] dark:scale-100 dark:opacity-100 dark:blur-none`}
			/>
		</button>
	);
}
