"use client";

import { ComputerIcon, Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "@wrksz/themes/client";
import type { ThemeSwitchProps } from "fumadocs-ui/layouts/shared/slots/theme-switch";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/cn";

const ITEMS = [
	["light", "Light", Sun03Icon],
	["dark", "Dark", Moon02Icon],
	["system", "System", ComputerIcon],
] as const satisfies readonly (readonly [string, string, IconSvgElement])[];

type Selection = (typeof ITEMS)[number][0];

const subscribe = () => () => {};

function item(active: boolean) {
	return cn(
		"flex size-6.5 items-center justify-center p-1.5",
		active ? "bg-fd-accent text-fd-accent-foreground" : "text-fd-muted-foreground",
	);
}

export function ThemeSwitch({ className, mode = "light-dark", ...props }: ThemeSwitchProps) {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const mounted = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);

	function change(next: Selection) {
		if (document.startViewTransition) {
			document.startViewTransition(() => flushSync(() => setTheme(next)));
		} else {
			setTheme(next);
		}
	}

	const container = cn(
		"inline-flex items-center overflow-hidden rounded-full border p-1 *:rounded-full",
		className,
	);

	if (mode === "light-dark") {
		const value = mounted ? resolvedTheme : null;
		return (
			<button
				type="button"
				className={container}
				aria-label="Toggle Theme"
				data-theme-toggle=""
				onClick={() => change(value === "light" ? "dark" : "light")}
			>
				{ITEMS.slice(0, 2).map(([key, , icon]) => (
					<span key={key} className={item(value === key)}>
						<HugeiconsIcon
							icon={icon}
							size={14}
							color="currentColor"
							strokeWidth={1.8}
						/>
					</span>
				))}
			</button>
		);
	}

	const value = mounted ? theme : null;
	return (
		<div className={container} data-theme-toggle="" {...props}>
			{ITEMS.map(([key, label, icon]) => (
				<button
					key={key}
					type="button"
					aria-label={label}
					className={item(value === key)}
					onClick={() => change(key)}
				>
					<HugeiconsIcon icon={icon} size={14} color="currentColor" strokeWidth={1.8} />
				</button>
			))}
		</div>
	);
}
