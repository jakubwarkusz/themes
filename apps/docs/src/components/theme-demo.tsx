"use client";

import { ClientThemeProvider, useTheme } from "@wrksz/themes/client";
import type { ReactNode } from "react";
import { avatarVars, DemoBar, DemoCard, quoted, Readout, Segmented, useMounted } from "./demo-kit";

const THEMES = ["light", "dark", "sepia", "forest"] as const;
const OPTIONS = [...THEMES, "system"] as const;
type Option = (typeof OPTIONS)[number];

const AVATAR = avatarVars("Ada Lovelace");

function Controls() {
	const { theme, resolvedTheme, setTheme } = useTheme<(typeof THEMES)[number]>();
	const mounted = useMounted();
	const selected: Option = mounted ? ((theme as Option | undefined) ?? "system") : "system";

	return (
		<>
			<DemoBar>
				<Segmented label="Theme" options={OPTIONS} value={selected} onChange={setTheme} />
				<Readout
					items={[
						["theme", quoted(theme, mounted)],
						["resolved", quoted(resolvedTheme, mounted)],
					]}
				/>
			</DemoBar>

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
	return (
		<DemoCard code={children}>
			<ClientThemeProvider
				themes={THEMES}
				defaultTheme="system"
				attribute="data-theme"
				target="#theme-demo"
				storage="none"
			>
				<Controls />
			</ClientThemeProvider>
		</DemoCard>
	);
}
