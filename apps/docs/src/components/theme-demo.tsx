"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ClientThemeProvider, useTheme } from "@wrksz/themes/client";
import {
	type CSSProperties,
	type ReactNode,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import { cn } from "@/lib/cn";
import { CodeCollapse } from "./code-block";

const THEMES = ["light", "dark", "sepia", "forest"] as const;
const OPTIONS = [...THEMES, "system"] as const;

const subscribe = () => () => {};

function hash(text: string) {
	let h = 0x811c9dc5;
	for (const char of text) {
		h ^= char.codePointAt(0) ?? 0;
		h = Math.imul(h, 0x01000193);
	}
	return h >>> 0;
}

function random(seed: number) {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function avatarVars(seed: string): CSSProperties {
	const next = random(hash(seed.trim().toLowerCase()));
	const hue = Math.floor(next() * 360);
	const spread = 25 + next() * 45;
	const point = () => `${Math.round(next() * 100)}%`;
	return {
		"--avatar-hue": hue,
		"--avatar-hue-2": Math.round(hue + spread),
		"--avatar-hue-3": Math.round(hue - spread * 0.8),
		"--avatar-x1": point(),
		"--avatar-y1": point(),
		"--avatar-x2": point(),
		"--avatar-y2": point(),
		"--avatar-x3": point(),
		"--avatar-y3": point(),
		"--avatar-angle": `${Math.round(next() * 360)}deg`,
	} as CSSProperties;
}

const AVATAR = avatarVars("Ada Lovelace");

function Controls() {
	const { theme, resolvedTheme, setTheme } = useTheme<(typeof THEMES)[number]>();
	const mounted = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
	const selected = mounted ? (theme ?? "system") : "system";
	const group = useRef<HTMLFieldSetElement>(null);
	const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
	const [picked, setPicked] = useState(false);

	useLayoutEffect(() => {
		const el = group.current;
		if (!el) return;
		const measure = () => {
			const button = el.querySelector<HTMLElement>(`[data-option="${selected}"]`);
			if (button) setPill({ left: button.offsetLeft, width: button.offsetWidth });
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(el);
		return () => observer.disconnect();
	}, [selected]);

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
				<fieldset ref={group} aria-label="Theme" className="relative flex h-8 min-w-0">
					<span
						aria-hidden
						className={cn(
							"absolute inset-y-0 left-0 rounded-md bg-fd-background shadow-[0_1px_2px_rgb(0_0_0/0.08)] motion-reduce:transition-none dark:bg-fd-secondary",
							!pill && "opacity-0",
							picked && "transition-[translate,width] duration-200 ease-out",
						)}
						style={
							pill ? { translate: `${pill.left}px 0`, width: pill.width } : undefined
						}
					/>
					{OPTIONS.map((option) => (
						<button
							key={option}
							type="button"
							data-option={option}
							aria-pressed={selected === option}
							onClick={() => {
								setPicked(true);
								setTheme(option);
							}}
							className={cn(
								"relative rounded-md px-3 text-xs font-medium capitalize outline-none transition-[color,scale] duration-150 focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]",
								selected === option
									? "text-fd-foreground"
									: "text-fd-muted-foreground hover:text-fd-foreground",
							)}
						>
							{option}
						</button>
					))}
				</fieldset>

				<p className="flex gap-x-4 px-3 font-mono text-xs">
					<span>
						<span className="text-fd-muted-foreground">theme </span>
						<span className="text-fd-foreground">{mounted ? `"${theme}"` : "…"}</span>
					</span>
					<span>
						<span className="text-fd-muted-foreground">resolved </span>
						<span className="text-fd-foreground">
							{mounted && resolvedTheme ? `"${resolvedTheme}"` : "…"}
						</span>
					</span>
				</p>
			</div>

			<div id="theme-demo" className="theme-demo rounded-lg p-5 select-none sm:p-6">
				<div className="flex items-center gap-3">
					<span aria-hidden className="demo-avatar size-8" style={AVATAR} />
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium">Ada Lovelace</p>
						<p className="text-xs text-(--demo-muted)">Commented on Reader view</p>
					</div>
					<span className="text-xs text-(--demo-muted)">2m</span>
				</div>
				<p className="mt-4 text-sm leading-relaxed">
					The sepia palette reads well at night. Could we ship it as the default for the
					reader view?
				</p>
				<div className="mt-4 flex flex-wrap gap-1.5">
					<span className="inline-flex h-6 items-center rounded-md bg-[color-mix(in_oklab,var(--demo-accent)_14%,transparent)] px-2 text-xs font-medium text-(--demo-fg)">
						Design
					</span>
					<span className="inline-flex h-6 items-center rounded-md border border-(--demo-border) px-2 text-xs text-(--demo-muted)">
						Reader view
					</span>
				</div>
				<div className="mt-5 flex items-center gap-2 border-t border-(--demo-border) pt-4">
					<span className="flex h-8 flex-1 items-center rounded-md border border-(--demo-border) bg-(--demo-surface) px-3 text-xs text-(--demo-muted)">
						Write a reply…
					</span>
					<span className="inline-flex h-8 items-center rounded-md bg-(--demo-accent) px-3 text-xs font-medium text-(--demo-accent-fg)">
						Reply
					</span>
				</div>
			</div>
		</>
	);
}

export function ThemeDemo({ children }: { children?: ReactNode }) {
	const [open, setOpen] = useState(false);
	const id = useId();

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

			{children ? (
				<div className="flex flex-col">
					<button
						type="button"
						aria-expanded={open}
						aria-controls={id}
						onClick={() => setOpen(!open)}
						className="flex h-8 w-fit items-center gap-1.5 rounded-md px-3 text-xs font-medium text-fd-muted-foreground outline-none transition-[color,scale] duration-150 ease-out hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]"
					>
						{open ? "Hide code" : "Show code"}
						<HugeiconsIcon
							icon={ArrowDown01Icon}
							size={12}
							color="currentColor"
							strokeWidth={2}
							className={cn(
								"transition-transform duration-200 ease-out motion-reduce:transition-none",
								open && "rotate-180",
							)}
						/>
					</button>
					<div
						id={id}
						inert={!open}
						className={cn(
							"grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
							open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
						)}
					>
						<div className="min-h-0 overflow-hidden">
							<div className="flex flex-col gap-1.5 pt-1.5 [&_figure]:my-0 [&_figure]:bg-fd-background">
								<CodeCollapse value={false}>{children}</CodeCollapse>
							</div>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}
