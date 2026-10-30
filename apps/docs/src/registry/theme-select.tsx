"use client";

import { useTheme } from "@wrksz/themes/client";
import { ChevronDownIcon } from "./theme-icons";

const THEMES = ["light", "dark", "system"] as const;

export function ThemeSelect() {
	const { theme, setTheme } = useTheme();

	return (
		<label className="relative inline-flex items-center">
			<span className="sr-only">Theme</span>
			<select
				value={theme ?? "system"}
				disabled={!theme}
				onChange={(event) => {
					const next = THEMES.find((value) => value === event.target.value);
					if (next) setTheme(next);
				}}
				className="h-9 appearance-none rounded-md border border-input bg-background ps-3 pe-8 text-sm text-foreground transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
			>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
				<option value="system">System</option>
			</select>
			<ChevronDownIcon className="pointer-events-none absolute end-2.5 size-3.5 text-muted-foreground" />
		</label>
	);
}
