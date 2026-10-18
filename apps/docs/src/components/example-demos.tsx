"use client";

import { ClientThemeProvider, useTheme } from "@wrksz/themes/client";
import { type ReactNode, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { DemoBar, DemoCard, MiniPreview, quoted, Readout, Segmented, useMounted } from "./demo-kit";

const PALETTE = ["light", "dark", "sepia", "forest"] as const;
const LIGHT_DARK = ["light", "dark"] as const;
type PaletteTheme = (typeof PALETTE)[number];

function useDom(
	read: () => string | null,
	observe: () => Node | null,
	options: MutationObserverInit,
) {
	return useSyncExternalStore(
		(notify) => {
			const target = observe();
			if (!target) return () => {};
			const observer = new MutationObserver(notify);
			observer.observe(target, options);
			return () => observer.disconnect();
		},
		read,
		() => null,
	);
}

function ThemePicker<T extends string>({
	options,
	label = "Theme",
}: {
	options: readonly T[];
	label?: string;
}) {
	const { theme, setTheme } = useTheme<T>();
	const mounted = useMounted();
	const value = (mounted ? theme : undefined) ?? options[0];
	return <Segmented label={label} options={options} value={value as T} onChange={setTheme} />;
}

function ScopedPane({
	id,
	name,
	title,
	body,
}: {
	id: string;
	name: string;
	title: string;
	body: string;
}) {
	const { resolvedTheme } = useTheme<PaletteTheme>();
	const mounted = useMounted();
	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<DemoBar>
				<ThemePicker options={PALETTE} label={`${title} theme`} />
			</DemoBar>
			<MiniPreview id={id} name={name} title={title} body={body} />
			<Readout items={[[`#${id}`, quoted(resolvedTheme, mounted)]]} />
		</div>
	);
}

export function ScopedDemo({ children }: { children?: ReactNode }) {
	return (
		<DemoCard code={children}>
			<div className="grid gap-x-1.5 gap-y-4 md:grid-cols-2">
				<ClientThemeProvider
					themes={PALETTE}
					defaultTheme="light"
					attribute="data-theme"
					target="#scoped-landing"
					storage="none"
				>
					<ScopedPane
						id="scoped-landing"
						name="Grace Hopper"
						title="Landing"
						body="Each section keeps its own theme."
					/>
				</ClientThemeProvider>
				<ClientThemeProvider
					themes={PALETTE}
					defaultTheme="dark"
					attribute="data-theme"
					target="#scoped-dashboard"
					storage="none"
				>
					<ScopedPane
						id="scoped-dashboard"
						name="Alan Turing"
						title="Dashboard"
						body="Switching one never touches the other."
					/>
				</ClientThemeProvider>
			</div>
		</DemoCard>
	);
}

const FORCED = ["none", "light", "dark", "sepia"] as const;
type Forced = (typeof FORCED)[number];

function ForcedControls({
	forced,
	setForced,
}: {
	forced: Forced;
	setForced: (value: Forced) => void;
}) {
	const { theme, resolvedTheme, forcedTheme } = useTheme<PaletteTheme>();
	const mounted = useMounted();
	return (
		<>
			<DemoBar>
				<ThemePicker options={PALETTE} />
				<Readout
					items={[
						["theme", quoted(theme, mounted)],
						["resolved", quoted(resolvedTheme, mounted)],
					]}
				/>
			</DemoBar>
			<DemoBar>
				<Segmented
					label="forcedTheme"
					options={FORCED}
					value={forced}
					onChange={setForced}
				/>
				<Readout items={[["forcedTheme", quoted(forcedTheme, mounted)]]} />
			</DemoBar>
			<MiniPreview
				id="forced-demo"
				name="Katherine Johnson"
				title={forced === "none" ? "Follows the picker" : `Forced to ${forced}`}
				body="A forced theme wins over the stored choice until you remove it."
			/>
		</>
	);
}

export function ForcedDemo({ children }: { children?: ReactNode }) {
	const [forced, setForced] = useState<Forced>("dark");
	return (
		<DemoCard code={children}>
			<ClientThemeProvider
				themes={PALETTE}
				defaultTheme="light"
				forcedTheme={forced === "none" ? undefined : forced}
				attribute="data-theme"
				target="#forced-demo"
				storage="none"
			>
				<ForcedControls forced={forced} setForced={setForced} />
			</ClientThemeProvider>
		</DemoCard>
	);
}

function TailwindControls() {
	const { resolvedTheme } = useTheme();
	const mounted = useMounted();
	const className = useDom(
		() => {
			const list = document.getElementById("tw-demo")?.classList;
			return list?.contains("tw-dark")
				? "tw-dark"
				: list?.contains("tw-light")
					? "tw-light"
					: null;
		},
		() => document.getElementById("tw-demo"),
		{ attributes: true, attributeFilter: ["class"] },
	);
	return (
		<>
			<DemoBar>
				<ThemePicker options={LIGHT_DARK} />
				<Readout
					items={[
						["resolved", quoted(resolvedTheme, mounted)],
						["class", quoted(className, mounted)],
					]}
				/>
			</DemoBar>
			<div
				id="tw-demo"
				className="rounded-lg bg-white p-4 text-zinc-900 select-none sm:p-5 [&.tw-dark]:bg-zinc-900 [&.tw-dark]:text-zinc-100"
			>
				<p className="text-sm font-medium">Usage this month</p>
				<p className="mt-1 text-xs text-zinc-500 in-[.tw-dark]:text-zinc-400">
					Styled with Tailwind classes and their dark: variants.
				</p>
				<div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100 in-[.tw-dark]:bg-zinc-800">
					<div className="h-full w-2/3 rounded-full bg-sky-500 in-[.tw-dark]:bg-sky-400" />
				</div>
				<div className="mt-4 flex gap-2">
					<span className="inline-flex h-7 items-center rounded-md bg-zinc-900 px-2.5 text-xs font-medium text-white in-[.tw-dark]:bg-white in-[.tw-dark]:text-zinc-900">
						Upgrade
					</span>
					<span className="inline-flex h-7 items-center rounded-md border border-zinc-200 px-2.5 text-xs in-[.tw-dark]:border-zinc-700">
						Details
					</span>
				</div>
			</div>
		</>
	);
}

export function TailwindDemo({ children }: { children?: ReactNode }) {
	return (
		<DemoCard code={children}>
			<ClientThemeProvider
				themes={LIGHT_DARK}
				defaultTheme="light"
				enableSystem={false}
				attribute="class"
				value={{ light: "tw-light", dark: "tw-dark" }}
				target="#tw-demo"
				storage="none"
			>
				<TailwindControls />
			</ClientThemeProvider>
		</DemoCard>
	);
}

function DataAttributeControls() {
	const mounted = useMounted();
	const attribute = useDom(
		() => document.getElementById("data-demo")?.getAttribute("data-theme") ?? null,
		() => document.getElementById("data-demo"),
		{ attributes: true, attributeFilter: ["data-theme"] },
	);
	return (
		<>
			<DemoBar>
				<ThemePicker options={PALETTE} />
				<Readout items={[["data-theme", quoted(attribute, mounted)]]} />
			</DemoBar>
			<MiniPreview
				id="data-demo"
				name="Margaret Hamilton"
				title="Styled by [data-theme]"
				body="The provider writes the theme into the attribute; CSS does the rest."
			/>
		</>
	);
}

export function DataAttributeDemo({ children }: { children?: ReactNode }) {
	return (
		<DemoCard code={children}>
			<ClientThemeProvider
				themes={PALETTE}
				defaultTheme="light"
				attribute="data-theme"
				target="#data-demo"
				storage="none"
			>
				<DataAttributeControls />
			</ClientThemeProvider>
		</DemoCard>
	);
}

const HYBRID_KEY = "wrksz-docs-hybrid-demo";

function readCookie() {
	const match = document.cookie.split("; ").find((part) => part.startsWith(`${HYBRID_KEY}=`));
	return match ? decodeURIComponent(match.slice(HYBRID_KEY.length + 1)) : null;
}

function readLocal() {
	try {
		return localStorage.getItem(HYBRID_KEY);
	} catch {
		return null;
	}
}

function subscribeStores(notify: () => void) {
	const timer = setInterval(notify, 250);
	window.addEventListener("storage", notify);
	return () => {
		clearInterval(timer);
		window.removeEventListener("storage", notify);
	};
}

function HybridControls() {
	const mounted = useMounted();
	const cookie = useSyncExternalStore(subscribeStores, readCookie, () => null);
	const local = useSyncExternalStore(subscribeStores, readLocal, () => null);
	return (
		<>
			<DemoBar>
				<ThemePicker options={LIGHT_DARK} />
				<Readout
					items={[
						["cookie", quoted(cookie, mounted)],
						["localStorage", quoted(local, mounted)],
					]}
				/>
			</DemoBar>
			<MiniPreview
				id="hybrid-demo"
				name="Hedy Lamarr"
				title="Cookie first, mirrored to localStorage"
				body="Open this page in a second tab and switch here: the other tab follows."
			/>
		</>
	);
}

export function HybridDemo({ children }: { children?: ReactNode }) {
	return (
		<DemoCard code={children}>
			<ClientThemeProvider
				themes={LIGHT_DARK}
				defaultTheme="light"
				enableSystem={false}
				attribute="data-theme"
				target="#hybrid-demo"
				storage="hybrid"
				storageKey={HYBRID_KEY}
			>
				<HybridControls />
			</ClientThemeProvider>
		</DemoCard>
	);
}

const THEME_COLORS: Record<PaletteTheme, string> = {
	light: "#fcfcfc",
	dark: "#141414",
	sepia: "#f4ecd8",
	forest: "#1d2620",
};

function MetaControls() {
	const mounted = useMounted();
	const color = useDom(
		() => document.querySelector('meta[name="theme-color"]')?.getAttribute("content") ?? null,
		() => document.head,
		{ subtree: true, childList: true, attributes: true, attributeFilter: ["content"] },
	);
	return (
		<>
			<DemoBar>
				<ThemePicker options={PALETTE} />
				<p className="flex items-center gap-2 px-3 font-mono text-xs">
					<span className="text-fd-muted-foreground">theme-color</span>
					<span
						aria-hidden
						className={cn(
							"size-3 rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]",
							!color && "opacity-0",
						)}
						style={{ background: color ?? undefined }}
					/>
					<span className="text-fd-foreground">{quoted(color, mounted)}</span>
				</p>
			</DemoBar>
			<MiniPreview
				id="meta-demo"
				name="Ada Lovelace"
				title="Browser chrome follows the theme"
				body="On Safari and installed PWAs the tab and status bar take this color."
			/>
		</>
	);
}

export function MetaThemeColorDemo({ children }: { children?: ReactNode }) {
	return (
		<DemoCard code={children}>
			<ClientThemeProvider
				themes={PALETTE}
				defaultTheme="light"
				attribute="data-theme"
				target="#meta-demo"
				storage="none"
				themeColor={THEME_COLORS}
			>
				<MetaControls />
			</ClientThemeProvider>
		</DemoCard>
	);
}
