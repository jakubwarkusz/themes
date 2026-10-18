"use client";

import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ClientThemeProvider } from "@wrksz/themes/client/extended-provider";
import { useTheme } from "@wrksz/themes/client";
import { useShiki } from "fumadocs-core/highlight/client";
import type { ShikiTransformer } from "shiki";
import {
	type ComponentProps,
	type CSSProperties,
	type ReactNode,
	Suspense,
	useDeferredValue,
	useId,
	useState,
	useSyncExternalStore,
} from "react";
import { codeThemes } from "@/lib/code-themes";
import { cn } from "@/lib/cn";
import {
	ATTRIBUTES,
	attributeValue,
	canUseExtended,
	canUseServerTheme,
	type Config,
	DEFAULT_CONFIG,
	effectiveDefault,
	FRAMEWORKS,
	type GeneratedFile,
	generate,
	STORAGES,
	systemMapValue,
	TARGETS,
	THEME_COLORS,
	THEME_NAME,
	targetValue,
	themeColorValue,
	usesCookie,
	valueMap,
} from "@/lib/configurator";
import { CodeBlock, CodeCollapse } from "./code-block";
import { quoted, Readout, Segmented, useMounted } from "./demo-kit";
import { ScrollFade } from "./scroll-fade";

const MAX_THEMES = 6;
const PREVIEW_ID = "configurator-preview";

const LABELS: Record<string, string> = {
	next: "Next.js",
	ssr: "Other SSR",
	both: "Both",
	custom: "Custom",
	localStorage: "local",
	sessionStorage: "session",
	off: "Off",
	single: "Single",
	"per-theme": "Per theme",
	none: "None",
	system: "System",
};

const label = (value: string) => LABELS[value] ?? value;

type Palette = {
	bg: string;
	fg: string;
	muted: string;
	border: string;
	accent: string;
	accentFg: string;
};

const PALETTES: Record<string, Palette> = {
	light: {
		bg: "#ffffff",
		fg: "#0a0a0a",
		muted: "#737373",
		border: "#e5e5e5",
		accent: "#0a0a0a",
		accentFg: "#ffffff",
	},
	dark: {
		bg: "#0a0a0a",
		fg: "#fafafa",
		muted: "#a3a3a3",
		border: "#262626",
		accent: "#fafafa",
		accentFg: "#0a0a0a",
	},
	sepia: {
		bg: "#f4ecd8",
		fg: "#433422",
		muted: "#8a7457",
		border: "#e2d5b8",
		accent: "#7a5c32",
		accentFg: "#f4ecd8",
	},
	forest: {
		bg: "#1d2620",
		fg: "#e3ebe0",
		muted: "#93a68f",
		border: "#2f3c33",
		accent: "#8fbf7f",
		accentFg: "#1d2620",
	},
	dim: {
		bg: "#1c1c1e",
		fg: "#f2f2f2",
		muted: "#9b9ba1",
		border: "#2e2e31",
		accent: "#f2f2f2",
		accentFg: "#1c1c1e",
	},
	paper: {
		bg: "#faf7f0",
		fg: "#2b2a27",
		muted: "#86827a",
		border: "#ebe5d8",
		accent: "#2b2a27",
		accentFg: "#faf7f0",
	},
	midnight: {
		bg: "#0f1424",
		fg: "#e6e9f2",
		muted: "#8b93ab",
		border: "#20283d",
		accent: "#8ea2ff",
		accentFg: "#0f1424",
	},
};

function hue(name: string) {
	let value = 0;
	for (const char of name) value = (value * 31 + (char.codePointAt(0) ?? 0)) % 360;
	return value;
}

function luminance(hex: string) {
	const match = /^#?([0-9a-f]{6})$/i.exec(hex);
	if (!match) return 1;
	const int = Number.parseInt(match[1], 16);
	return (0.299 * (int >> 16) + 0.587 * ((int >> 8) & 255) + 0.114 * (int & 255)) / 255;
}

function paletteFor(theme: string, color?: string): Palette {
	const known = PALETTES[theme];
	const darkName = /dark|dim|night|black|contrast|ink/.test(theme);
	const h = hue(theme);
	const base: Palette = known ?? {
		bg: darkName ? `hsl(${h} 18% 10%)` : `hsl(${h} 40% 96%)`,
		fg: darkName ? `hsl(${h} 20% 92%)` : `hsl(${h} 30% 14%)`,
		muted: darkName ? `hsl(${h} 10% 62%)` : `hsl(${h} 10% 45%)`,
		border: darkName ? `hsl(${h} 14% 20%)` : `hsl(${h} 25% 86%)`,
		accent: `hsl(${h} 60% ${darkName ? 70 : 40}%)`,
		accentFg: darkName ? `hsl(${h} 18% 10%)` : "#ffffff",
	};
	if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return base;
	const dark = luminance(color) < 0.5;
	return {
		...base,
		bg: color,
		fg: dark ? "#f5f5f5" : "#111111",
		muted: dark ? "#a3a3a3" : "#6b6b6b",
		border: dark ? "rgb(255 255 255 / 0.12)" : "rgb(0 0 0 / 0.1)",
	};
}

function normalize(config: Config): Config {
	const themes = config.themes.length ? config.themes : ["light"];
	const has = (theme: string) => themes.includes(theme);
	return {
		...config,
		themes,
		defaultTheme:
			config.defaultTheme === "system" || has(config.defaultTheme)
				? config.defaultTheme
				: themes[0],
		forcedTheme: has(config.forcedTheme) ? config.forcedTheme : "",
		systemLight: has(config.systemLight) ? config.systemLight : themes[0],
		systemDark: has(config.systemDark) ? config.systemDark : (themes.at(-1) ?? themes[0]),
		serverTheme: config.serverTheme && canUseServerTheme(config),
	};
}

function Group({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-4 rounded-xl bg-fd-card p-4">
			<h3 className="text-sm font-medium text-fd-muted-foreground">{title}</h3>
			{children}
		</section>
	);
}

function Field({
	name,
	hint,
	children,
	disabled,
}: {
	name: string;
	hint?: ReactNode;
	children: ReactNode;
	disabled?: boolean;
}) {
	return (
		<div className={cn("flex flex-col gap-2", disabled && "opacity-50")}>
			<span className="text-sm text-fd-foreground">{name}</span>
			{children}
			{hint ? (
				<p className="text-xs leading-relaxed text-fd-muted-foreground">{hint}</p>
			) : null}
		</div>
	);
}

function Choice<T extends string>({
	name,
	options,
	value,
	onChange,
	disabled,
	format = label,
}: {
	name: string;
	options: readonly T[];
	value: T;
	onChange: (value: T) => void;
	disabled?: boolean;
	format?: (value: T) => string;
}) {
	return (
		<ScrollFade className="-mx-1 overflow-x-auto px-1 scrollbar-none">
			<div className="w-fit rounded-lg bg-fd-background p-0.5 dark:bg-fd-secondary/40">
				<Segmented
					label={name}
					options={options}
					value={value}
					onChange={onChange}
					disabled={disabled}
					format={format}
				/>
			</div>
		</ScrollFade>
	);
}

function Toggle({
	name,
	hint,
	checked,
	onChange,
	disabled,
}: {
	name: string;
	hint?: ReactNode;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}) {
	const id = useId();
	return (
		<div className={cn("flex flex-col gap-1", disabled && "opacity-50")}>
			<div className="flex items-center justify-between gap-4">
				<label htmlFor={id} className="text-sm text-fd-foreground">
					{name}
				</label>
				<button
					id={id}
					type="button"
					role="switch"
					aria-label={name}
					aria-checked={checked}
					disabled={disabled}
					onClick={() => onChange(!checked)}
					className={cn(
						"relative h-5 w-8.5 shrink-0 rounded-full outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-fd-ring",
						checked ? "bg-fd-foreground" : "bg-fd-border",
					)}
				>
					<span
						aria-hidden
						className={cn(
							"absolute top-0.5 left-0.5 size-4 rounded-full bg-fd-background shadow-[0_1px_2px_rgb(0_0_0/0.15)] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
							checked && "translate-x-3.5",
						)}
					/>
				</button>
			</div>
			{hint ? (
				<p className="text-xs leading-relaxed text-fd-muted-foreground">{hint}</p>
			) : null}
		</div>
	);
}

function TextInput({ className, ...props }: ComponentProps<"input">) {
	return (
		<input
			spellCheck={false}
			autoComplete="off"
			className={cn(
				"h-8 w-full min-w-0 rounded-md bg-fd-background px-2.5 font-mono text-xs text-fd-foreground outline-none transition-shadow duration-150 placeholder:text-fd-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-fd-ring dark:bg-fd-secondary/40",
				className,
			)}
			{...props}
		/>
	);
}

function ThemeList({
	themes,
	onChange,
}: {
	themes: string[];
	onChange: (themes: string[]) => void;
}) {
	const [draft, setDraft] = useState("");
	const name = draft.trim().toLowerCase();
	const error =
		name && !THEME_NAME.test(name)
			? "Lowercase letters, digits and dashes."
			: themes.includes(name)
				? "Already added."
				: undefined;
	const full = themes.length >= MAX_THEMES;

	const add = () => {
		if (!name || error || full) return;
		onChange([...themes, name]);
		setDraft("");
	};

	return (
		<div className="flex flex-col gap-2">
			<ul className="flex flex-wrap gap-1.5">
				{themes.map((theme) => (
					<li
						key={theme}
						className="flex h-7 items-center gap-1 rounded-md bg-fd-background ps-2.5 pe-1 font-mono text-xs text-fd-foreground dark:bg-fd-secondary/40"
					>
						{theme}
						<button
							type="button"
							aria-label={`Remove ${theme}`}
							disabled={themes.length === 1}
							onClick={() => onChange(themes.filter((item) => item !== theme))}
							className="flex size-5 items-center justify-center rounded-sm text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring disabled:opacity-40"
						>
							<HugeiconsIcon
								icon={Cancel01Icon}
								size={11}
								color="currentColor"
								strokeWidth={2}
							/>
						</button>
					</li>
				))}
			</ul>
			<TextInput
				aria-label="Add theme"
				placeholder={full ? `Up to ${MAX_THEMES} themes` : "Add a theme and press Enter"}
				disabled={full}
				value={draft}
				aria-invalid={Boolean(error)}
				onChange={(event) => setDraft(event.target.value)}
				onKeyDown={(event) => {
					if (event.key !== "Enter" && event.key !== ",") return;
					event.preventDefault();
					add();
				}}
			/>
			{error ? <p className="text-xs text-fd-muted-foreground">{error}</p> : null}
		</div>
	);
}

function Controls({
	config,
	update,
}: {
	config: Config;
	update: (patch: Partial<Config>) => void;
}) {
	const server = canUseServerTheme(config);
	const extended = canUseExtended(config);
	const defaults = config.enableSystem ? ["system", ...config.themes] : config.themes;

	return (
		<div className="flex flex-col gap-3">
			<Group title="Setup">
				<Field name="Framework">
					<Choice
						name="Framework"
						options={FRAMEWORKS}
						value={config.framework}
						onChange={(framework) => update({ framework })}
					/>
				</Field>
				<Toggle
					name="Typed factory"
					hint="createThemes binds the provider and hooks to your theme names."
					checked={config.factory}
					onChange={(factory) => update({ factory })}
				/>
			</Group>

			<Group title="Themes">
				<ThemeList themes={config.themes} onChange={(themes) => update({ themes })} />
				<Toggle
					name="System preference"
					checked={config.enableSystem}
					onChange={(enableSystem) => update({ enableSystem })}
				/>
				<Field name="Default theme">
					<Choice
						name="Default theme"
						options={defaults}
						value={effectiveDefault(config)}
						onChange={(defaultTheme) => update({ defaultTheme })}
						format={(value) => (value === "system" ? "System" : value)}
					/>
				</Field>
				<Toggle
					name="Always follow system"
					hint="Ignores the stored choice and tracks the OS."
					checked={config.followSystem && config.enableSystem}
					disabled={!config.enableSystem}
					onChange={(followSystem) => update({ followSystem })}
				/>
				<Field name="Forced theme">
					<Choice
						name="Forced theme"
						options={["none", ...config.themes]}
						value={config.forcedTheme || "none"}
						onChange={(value) => update({ forcedTheme: value === "none" ? "" : value })}
						format={(value) => (value === "none" ? "None" : value)}
					/>
				</Field>
			</Group>

			<Group title="DOM">
				<Field name="Attribute">
					<Choice
						name="Attribute"
						options={ATTRIBUTES}
						value={config.attribute}
						onChange={(attribute) => update({ attribute })}
					/>
					{config.attribute === "custom" ? (
						<TextInput
							aria-label="Custom attribute"
							value={config.customAttribute}
							placeholder="data-mode"
							onChange={(event) => update({ customAttribute: event.target.value })}
						/>
					) : null}
				</Field>
				<Field name="Target">
					<Choice
						name="Target"
						options={TARGETS}
						value={config.target}
						onChange={(target) => update({ target })}
					/>
					{config.target === "custom" ? (
						<TextInput
							aria-label="Target selector"
							value={config.customTarget}
							placeholder="#app"
							onChange={(event) => update({ customTarget: event.target.value })}
						/>
					) : null}
				</Field>
				<Field name="Attribute values" hint="Optional. Leave empty to use the theme name.">
					<div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5">
						{config.themes.map((theme) => (
							<label key={theme} className="contents">
								<span className="font-mono text-xs text-fd-muted-foreground">
									{theme}
								</span>
								<TextInput
									value={config.values[theme] ?? ""}
									placeholder={theme}
									onChange={(event) =>
										update({
											values: {
												...config.values,
												[theme]: event.target.value,
											},
										})
									}
								/>
							</label>
						))}
					</div>
				</Field>
				<Toggle
					name="Disable transitions on change"
					checked={config.disableTransition}
					onChange={(disableTransition) => update({ disableTransition })}
				/>
				<Toggle
					name="Set color-scheme"
					hint="Applies only to themes named light or dark."
					checked={config.enableColorScheme}
					onChange={(enableColorScheme) => update({ enableColorScheme })}
				/>
			</Group>

			<Group title="Storage">
				<Field
					name="Storage"
					hint={
						config.storage === "hybrid"
							? "Cookie for the server, mirrored to localStorage for cross-tab sync."
							: config.storage === "cookie"
								? "Readable on the server. No cross-tab sync."
								: config.storage === "none"
									? "Nothing is persisted."
									: undefined
					}
				>
					<Choice
						name="Storage"
						options={STORAGES}
						value={config.storage}
						onChange={(storage) => update({ storage })}
					/>
				</Field>
				<Field name="Key">
					<TextInput
						aria-label="Storage key"
						value={config.storageKey}
						placeholder="theme"
						disabled={config.storage === "none"}
						onChange={(event) => update({ storageKey: event.target.value })}
					/>
				</Field>
				{usesCookie(config) ? (
					<>
						<Field name="Cookie SameSite">
							<Choice
								name="Cookie SameSite"
								options={["Lax", "Strict", "None"] as const}
								value={config.sameSite}
								onChange={(sameSite) => update({ sameSite })}
							/>
						</Field>
						<Field name="Cookie domain">
							<TextInput
								aria-label="Cookie domain"
								value={config.cookieDomain}
								placeholder="Current domain"
								onChange={(event) => update({ cookieDomain: event.target.value })}
							/>
						</Field>
					</>
				) : null}
				<Toggle
					name="Read the theme on the server"
					hint={
						server
							? "getTheme reads the cookie in the layout and passes initialTheme."
							: "Needs Next.js with cookie or hybrid storage."
					}
					checked={config.serverTheme && server}
					disabled={!server}
					onChange={(serverTheme) => update({ serverTheme })}
				/>
			</Group>

			<Group title="Browser">
				<Field name="theme-color meta">
					<Choice
						name="theme-color meta"
						options={THEME_COLORS}
						value={config.themeColor}
						onChange={(themeColor) => update({ themeColor })}
					/>
					{config.themeColor === "single" ? (
						<TextInput
							aria-label="theme-color value"
							value={config.themeColorSingle}
							placeholder="var(--background)"
							onChange={(event) => update({ themeColorSingle: event.target.value })}
						/>
					) : null}
					{config.themeColor === "per-theme" ? (
						<div className="flex flex-wrap gap-1.5">
							{config.themes.map((theme) => (
								<label
									key={theme}
									className="flex h-7 items-center gap-1.5 rounded-md bg-fd-background ps-1 pe-2.5 font-mono text-xs text-fd-foreground focus-within:ring-2 focus-within:ring-fd-ring dark:bg-fd-secondary/40"
								>
									<input
										type="color"
										value={config.themeColors[theme] ?? paletteHex(theme)}
										onChange={(event) =>
											update({
												themeColors: {
													...config.themeColors,
													[theme]: event.target.value,
												},
											})
										}
										className="size-5 rounded-sm border-0 bg-transparent p-0 outline-none [&::-webkit-color-swatch]:rounded-sm [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
									/>
									{theme}
								</label>
							))}
						</div>
					) : null}
				</Field>
			</Group>

			<Group title="Extended provider">
				<Toggle
					name="Map system to custom themes"
					hint={
						extended
							? "systemThemeMap resolves the OS preference to your own theme names."
							: "Next.js only, without the typed factory."
					}
					checked={config.systemMap && extended && config.enableSystem}
					disabled={!extended || !config.enableSystem}
					onChange={(systemMap) => update({ systemMap })}
				/>
				{systemMapValue(config) ? (
					<div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
						<span className="text-xs text-fd-muted-foreground">Light OS</span>
						<Choice
							name="System light theme"
							options={config.themes}
							value={systemMapValue(config)?.light ?? config.themes[0]}
							onChange={(systemLight) => update({ systemLight })}
							format={(value) => value}
						/>
						<span className="text-xs text-fd-muted-foreground">Dark OS</span>
						<Choice
							name="System dark theme"
							options={config.themes}
							value={systemMapValue(config)?.dark ?? config.themes[0]}
							onChange={(systemDark) => update({ systemDark })}
							format={(value) => value}
						/>
					</div>
				) : null}
				<Toggle
					name="Sync providers on one page"
					hint="enableSameDocumentSync shares changes between providers with the same key."
					checked={config.sameDocumentSync && extended && config.storage !== "none"}
					disabled={!extended || config.storage === "none"}
					onChange={(sameDocumentSync) => update({ sameDocumentSync })}
				/>
			</Group>

			<Group title="Extras">
				<Toggle
					name="Tailwind CSS variants"
					checked={config.tailwind}
					onChange={(tailwind) => update({ tailwind })}
				/>
				<Toggle
					name="Theme switcher component"
					checked={config.switcher}
					onChange={(switcher) => update({ switcher })}
				/>
			</Group>
		</div>
	);
}

function paletteHex(theme: string) {
	const bg = paletteFor(theme).bg;
	return bg.startsWith("#") ? bg : "#ffffff";
}

function useElementAttributes(id: string, names: string[]) {
	const key = names.join(" ");
	return useSyncExternalStore(
		(notify) => {
			const el = document.getElementById(id);
			if (!el) return () => {};
			const observer = new MutationObserver(notify);
			observer.observe(el, { attributes: true });
			return () => observer.disconnect();
		},
		() => {
			const el = document.getElementById(id);
			if (!el) return "";
			const parts = key
				.split(" ")
				.map((name) => {
					const value = el.getAttribute(name === "class" ? "class" : name);
					return value ? `${name}="${value}"` : "";
				})
				.filter(Boolean);
			const scheme = el.style.colorScheme;
			if (scheme) parts.push(`style="color-scheme: ${scheme}"`);
			return parts.join(" ");
		},
		() => "",
	);
}

function PreviewSurface({ config }: { config: Config }) {
	const { theme, resolvedTheme, setTheme, forcedTheme } = useTheme<string>();
	const mounted = useMounted();
	const attribute = attributeValue(config);
	const names = Array.isArray(attribute) ? attribute : [attribute];
	const attributes = useElementAttributes(PREVIEW_ID, names);
	const options = config.enableSystem ? ["system", ...config.themes] : config.themes;
	const color = themeColorValue(config);
	const resolved = mounted ? resolvedTheme : undefined;
	const meta = typeof color === "string" ? color : resolved ? color?.[resolved] : undefined;
	const palette = paletteFor(
		resolved ?? config.themes[0],
		config.themeColor === "per-theme" ? meta : undefined,
	);
	const tag =
		targetValue(config) === "html" ? "html" : targetValue(config) === "body" ? "body" : "div";

	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
				<Choice
					name="Preview theme"
					options={options}
					value={(mounted ? theme : undefined) ?? options[0]}
					onChange={(value) => setTheme(value)}
					disabled={Boolean(forcedTheme)}
					format={(value) => (value === "system" ? "System" : value)}
				/>
				<Readout
					items={[
						["theme", quoted(theme, mounted)],
						["resolved", quoted(resolvedTheme, mounted)],
					]}
				/>
			</div>
			<div
				className="rounded-lg p-4 select-none sm:p-5"
				style={
					{
						background: palette.bg,
						color: palette.fg,
						"--p-muted": palette.muted,
						"--p-border": palette.border,
						"--p-accent": palette.accent,
						"--p-accent-fg": palette.accentFg,
					} as CSSProperties
				}
			>
				<p className="font-mono text-xs break-all text-(--p-muted)">
					{"<"}
					{tag}
					{attributes ? ` ${attributes}` : ""}
					{">"}
				</p>
				<p className="mt-3 text-sm font-medium">{resolved ?? "…"}</p>
				<p className="mt-1 text-xs text-(--p-muted)">
					{forcedTheme
						? "Forced by the provider."
						: "Pick a theme above or change the options."}
				</p>
				<div className="mt-4 flex items-center gap-2">
					<span className="inline-flex h-7 items-center rounded-md bg-(--p-accent) px-2.5 text-xs font-medium text-(--p-accent-fg)">
						Primary
					</span>
					<span className="inline-flex h-7 items-center rounded-md border border-(--p-border) px-2.5 text-xs">
						Secondary
					</span>
					{meta ? (
						<span className="ms-auto flex items-center gap-1.5 font-mono text-xs text-(--p-muted)">
							<span
								aria-hidden
								className="size-3 rounded-sm shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
								style={{ background: meta }}
							/>
							theme-color
						</span>
					) : null}
				</div>
			</div>
			<div id={PREVIEW_ID} hidden />
		</div>
	);
}

function Preview({ config }: { config: Config }) {
	const values = valueMap(config);
	const map = systemMapValue(config);
	const providerKey = JSON.stringify([
		config.themes,
		config.enableSystem,
		effectiveDefault(config),
		config.forcedTheme,
		config.followSystem,
		attributeValue(config),
		values,
		map,
		config.enableColorScheme,
	]);

	return (
		<ClientThemeProvider
			key={providerKey}
			themes={config.themes}
			enableSystem={config.enableSystem}
			defaultTheme={effectiveDefault(config)}
			forcedTheme={config.forcedTheme || undefined}
			followSystem={config.followSystem && config.enableSystem}
			attribute={attributeValue(config)}
			value={values}
			systemThemeMap={map}
			enableColorScheme={config.enableColorScheme}
			target={`#${PREVIEW_ID}`}
			storage="none"
		>
			<PreviewSurface config={config} />
		</ClientThemeProvider>
	);
}

type HastNode = { type: string; value?: string; children?: HastNode[] };

function text(node: HastNode): string {
	return node.value ?? node.children?.map(text).join("") ?? "";
}

function stripLead(node: HastNode): boolean {
	if (node.value !== undefined) {
		node.value = node.value.replace(/^[\t ]+/, "");
		return node.value.length > 0;
	}
	for (const child of node.children ?? []) if (stripLead(child)) return true;
	return false;
}

const hangingIndent: ShikiTransformer = {
	line(node) {
		const lead = /^[\t ]*/.exec(text(node))?.[0] ?? "";
		if (!lead) return;
		const columns = [...lead].reduce((sum, char) => sum + (char === "\t" ? 2 : 1), 0);
		stripLead(node);
		node.properties.style = `margin-inline-start:${columns}ch`;
	},
};

function Highlighted({ file }: { file: GeneratedFile }) {
	return useShiki(file.code, {
		lang: file.lang,
		themes: codeThemes,
		defaultColor: false,
		transformers: [hangingIndent],
		components: {
			pre: ({ className, ...props }) => (
				<CodeBlock title={file.path} copyValue={file.code}>
					<pre
						className={cn(
							className,
							"w-full py-3.5 text-[0.875rem] leading-relaxed whitespace-pre-wrap outline-none wrap-anywhere tab-2 *:flex *:flex-col",
						)}
						{...props}
					/>
				</CodeBlock>
			),
		},
	});
}

function Plain({ file }: { file: GeneratedFile }) {
	return (
		<CodeBlock title={file.path} copyValue={file.code}>
			<pre className="w-full px-4 py-3.5 text-[0.875rem] leading-relaxed whitespace-pre-wrap text-fd-muted-foreground wrap-anywhere tab-2">
				{file.code}
			</pre>
		</CodeBlock>
	);
}

function Output({ config }: { config: Config }) {
	const deferred = useDeferredValue(config);
	const files = generate(deferred);

	return (
		<CodeCollapse value={false}>
			<div className="flex flex-col [&_figure]:my-0 gap-3">
				{files.map((file) => (
					<Suspense key={file.path} fallback={<Plain file={file} />}>
						<Highlighted file={file} />
					</Suspense>
				))}
			</div>
		</CodeCollapse>
	);
}

export function Configurator() {
	const [config, setConfig] = useState(DEFAULT_CONFIG);
	const update = (patch: Partial<Config>) =>
		setConfig((current) => normalize({ ...current, ...patch }));

	return (
		<div className="not-prose my-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
			<Controls config={config} update={update} />
			<div className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-[calc(var(--fd-docs-row-1,0px)+1.5rem)] lg:max-h-[calc(100dvh-var(--fd-docs-row-1,0px)-3rem)] lg:self-start lg:-m-1 lg:overflow-y-auto lg:overscroll-contain lg:p-1 lg:scrollbar-none">
				<div className="flex flex-col gap-1.5 rounded-xl bg-fd-card p-1.5">
					<Preview config={config} />
				</div>
				<div className="flex items-center justify-between gap-4">
					<h3 className="text-sm font-medium text-fd-muted-foreground">Generated code</h3>
					<button
						type="button"
						onClick={() => setConfig(DEFAULT_CONFIG)}
						className="rounded-md px-2 py-1 text-xs text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring"
					>
						Reset
					</button>
				</div>
				<Output config={config} />
			</div>
		</div>
	);
}
