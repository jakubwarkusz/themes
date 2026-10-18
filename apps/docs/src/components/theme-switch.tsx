"use client";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "@wrksz/themes/client";
import { useState } from "react";
import { cn } from "@/lib/cn";

const sunAtRest = "scale-[0.25] opacity-0 blur-xs dark:scale-100 dark:opacity-100 dark:blur-none";
const moonAtRest = "dark:scale-[0.25] dark:opacity-0 dark:blur-xs";
const enter = "animate-[icon-in_300ms_cubic-bezier(0.2,0,0,1)_both]";
const leave = "animate-[icon-out_300ms_cubic-bezier(0.2,0,0,1)_both]";

export function ThemeSwitch() {
	const { resolvedTheme, setTheme } = useTheme();
	const [switched, setSwitched] = useState(false);
	const dark = resolvedTheme === "dark";
	const light = resolvedTheme === "light";
	const label = dark ? "Switch to light theme" : "Switch to dark theme";

	return (
		<button
			type="button"
			data-theme-toggle=""
			onClick={() => {
				setSwitched(true);
				setTheme(dark ? "light" : "dark");
			}}
			aria-label={label}
			title={label}
			className="relative flex size-8 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-fd-card hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]"
		>
			<HugeiconsIcon
				icon={Sun03Icon}
				size={16}
				color="currentColor"
				strokeWidth={1.8}
				className={cn("absolute", switched ? (dark ? enter : leave) : sunAtRest)}
			/>
			<HugeiconsIcon
				icon={Moon02Icon}
				size={16}
				color="currentColor"
				strokeWidth={1.8}
				className={cn("absolute", switched ? (light ? enter : leave) : moonAtRest)}
			/>
		</button>
	);
}
