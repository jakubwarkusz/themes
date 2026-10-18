"use client";

import { ClientThemeProvider, useTheme } from "@wrksz/themes/client";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const THEMES = ["light", "dark", "sepia", "forest"] as const;
const OPTIONS = [...THEMES, "system"] as const;

const subscribe = () => () => {};

function Controls() {
	const { theme, resolvedTheme, setTheme } = useTheme<(typeof THEMES)[number]>();
	const mounted = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
	const selected = mounted ? (theme ?? "system") : "system";
	const active = OPTIONS.indexOf(selected as (typeof OPTIONS)[number]);

	return (
		<>
			<fieldset
				aria-label="Theme"
				className="relative grid h-8 w-full min-w-0 grid-cols-5 sm:w-80"
			>
				<span
					aria-hidden
					className="absolute inset-y-0 left-0 w-1/5 rounded-md bg-fd-background shadow-[0_1px_2px_rgb(0_0_0/0.08)] transition-transform duration-200 ease-out motion-reduce:transition-none dark:bg-fd-secondary"
					style={{ transform: `translateX(${Math.max(active, 0) * 100}%)` }}
				/>
				{OPTIONS.map((option) => (
					<button
						key={option}
						type="button"
						aria-pressed={selected === option}
						onClick={() => setTheme(option)}
						className={cn(
							"relative rounded-md text-xs font-medium capitalize outline-none transition-[color,scale] duration-150 focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]",
							selected === option
								? "text-fd-foreground"
								: "text-fd-muted-foreground hover:text-fd-foreground",
						)}
					>
						{option}
					</button>
				))}
			</fieldset>

			<div id="theme-demo" className="theme-demo rounded-lg p-5 sm:p-6">
				<div className="flex items-center gap-3">
					<span
						aria-hidden
						className="flex size-8 items-center justify-center rounded-full bg-(--demo-accent) text-xs font-semibold text-(--demo-accent-fg)"
					>
						AL
					</span>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium">Ada Lovelace</p>
						<p className="text-xs text-(--demo-muted)">Commented on your theme</p>
					</div>
					<span className="text-xs text-(--demo-muted)">2m</span>
				</div>
				<p className="mt-4 text-sm leading-relaxed">
					The sepia palette reads well at night. Could we ship it as the default for the
					reader view?
				</p>
				<div className="mt-5 flex gap-2">
					<span className="inline-flex h-8 items-center rounded-md bg-(--demo-accent) px-3 text-xs font-medium text-(--demo-accent-fg)">
						Reply
					</span>
					<span className="inline-flex h-8 items-center rounded-md border border-(--demo-border) px-3 text-xs font-medium">
						Mark as read
					</span>
				</div>
			</div>

			<p className="flex flex-wrap gap-x-5 gap-y-1 px-2.5 pt-0.5 pb-1.5 font-mono text-xs">
				<span>
					<span className="text-fd-muted-foreground">theme </span>
					<span className="text-fd-foreground">{mounted ? `"${theme}"` : "…"}</span>
				</span>
				<span>
					<span className="text-fd-muted-foreground">resolvedTheme </span>
					<span className="text-fd-foreground">
						{mounted && resolvedTheme ? `"${resolvedTheme}"` : "…"}
					</span>
				</span>
			</p>
		</>
	);
}

export function ThemeDemo() {
	return (
		<div className="not-prose my-6 flex flex-col gap-1.5 rounded-xl bg-fd-card p-1.5">
			<ClientThemeProvider
				themes={THEMES}
				defaultTheme="system"
				attribute="data-theme"
				target="#theme-demo"
				storage="none"
			>
				<Controls />
			</ClientThemeProvider>
		</div>
	);
}
