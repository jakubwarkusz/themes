"use client";

import { useTheme } from "@wrksz/themes/client";
import { MoonIcon, SunIcon, SystemIcon } from "./theme-icons";

const ORDER = ["light", "dark", "system"] as const;

const OPTIONS = {
	light: { label: "Light", Icon: SunIcon },
	dark: { label: "Dark", Icon: MoonIcon },
	system: { label: "System", Icon: SystemIcon },
};

export function ThemeCycle() {
	const { theme, setTheme } = useTheme();
	const current = ORDER.find((value) => value === theme);
	const next = ORDER[(ORDER.indexOf(current ?? "system") + 1) % ORDER.length];
	const Icon = current ? OPTIONS[current].Icon : null;

	return (
		<button
			type="button"
			onClick={() => setTheme(next)}
			aria-label={`Theme: ${current ? OPTIONS[current].label : "loading"}. Switch to ${OPTIONS[next].label}`}
			className="inline-flex h-9 min-w-27 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-[background-color,scale] duration-150 ease-out hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.97]"
		>
			{Icon ? <Icon className="size-4 text-muted-foreground" /> : <span className="size-4" />}
			<span>{current ? OPTIONS[current].label : "Theme"}</span>
		</button>
	);
}
