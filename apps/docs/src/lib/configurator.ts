export const STORAGES = ["localStorage", "sessionStorage", "cookie", "hybrid", "none"] as const;
export const ATTRIBUTES = ["class", "data-theme", "both", "custom"] as const;
export const TARGETS = ["html", "body", "custom"] as const;
export const THEME_COLORS = ["off", "single", "per-theme"] as const;
export const FRAMEWORKS = ["next", "ssr"] as const;

export type Storage = (typeof STORAGES)[number];
export type AttributeMode = (typeof ATTRIBUTES)[number];
export type TargetMode = (typeof TARGETS)[number];
export type ThemeColorMode = (typeof THEME_COLORS)[number];
export type Framework = (typeof FRAMEWORKS)[number];

export type Config = {
	framework: Framework;
	factory: boolean;
	themes: string[];
	enableSystem: boolean;
	defaultTheme: string;
	forcedTheme: string;
	followSystem: boolean;
	attribute: AttributeMode;
	customAttribute: string;
	values: Record<string, string>;
	target: TargetMode;
	customTarget: string;
	storage: Storage;
	storageKey: string;
	sameSite: "Lax" | "Strict" | "None";
	cookieDomain: string;
	serverTheme: boolean;
	themeColor: ThemeColorMode;
	themeColorSingle: string;
	themeColors: Record<string, string>;
	disableTransition: boolean;
	enableColorScheme: boolean;
	sameDocumentSync: boolean;
	systemMap: boolean;
	systemLight: string;
	systemDark: string;
	tailwind: boolean;
	switcher: boolean;
};

export type GeneratedFile = { path: string; lang: "tsx" | "ts" | "css"; code: string };

export const DEFAULT_CONFIG: Config = {
	framework: "next",
	factory: false,
	themes: ["light", "dark"],
	enableSystem: true,
	defaultTheme: "system",
	forcedTheme: "",
	followSystem: false,
	attribute: "class",
	customAttribute: "data-mode",
	values: {},
	target: "html",
	customTarget: "#app",
	storage: "localStorage",
	storageKey: "theme",
	sameSite: "Lax",
	cookieDomain: "",
	serverTheme: false,
	themeColor: "off",
	themeColorSingle: "#ffffff",
	themeColors: { light: "#ffffff", dark: "#0a0a0a" },
	disableTransition: true,
	enableColorScheme: true,
	sameDocumentSync: false,
	systemMap: false,
	systemLight: "light",
	systemDark: "dark",
	tailwind: true,
	switcher: true,
};

const DEFAULT_THEMES = ["light", "dark"];

export const THEME_NAME = /^[a-z][a-z0-9-]*$/;
export const DATA_ATTRIBUTE = /^data-[a-z][a-z0-9-]*$/;

export function canUseServerTheme(config: Config) {
	return (
		config.framework === "next" && (config.storage === "cookie" || config.storage === "hybrid")
	);
}

export function canUseExtended(config: Config) {
	return config.framework === "next" && !config.factory;
}

export function usesCookie(config: Config) {
	return config.storage === "cookie" || config.storage === "hybrid";
}

export function effectiveDefault(config: Config) {
	const fallback = config.themes[0] ?? "light";
	if (config.defaultTheme === "system") return config.enableSystem ? "system" : fallback;
	return config.themes.includes(config.defaultTheme) ? config.defaultTheme : fallback;
}

type AttributeName = "class" | `data-${string}`;

export function attributeValue(config: Config): AttributeName | AttributeName[] {
	if (config.attribute === "both") return ["class", "data-theme"];
	if (config.attribute === "custom")
		return DATA_ATTRIBUTE.test(config.customAttribute)
			? (config.customAttribute as AttributeName)
			: "data-theme";
	return config.attribute;
}

export function targetValue(config: Config) {
	if (config.target === "custom") return config.customTarget.trim() || "html";
	return config.target;
}

export function valueMap(config: Config) {
	const entries = config.themes
		.map((theme) => [theme, config.values[theme]?.trim() ?? ""] as const)
		.filter(([theme, value]) => value && value !== theme);
	return entries.length ? Object.fromEntries(entries) : undefined;
}

export function themeColorValue(config: Config) {
	if (config.themeColor === "single") return config.themeColorSingle;
	if (config.themeColor === "per-theme")
		return Object.fromEntries(
			config.themes.map((theme) => [theme, config.themeColors[theme] ?? "#ffffff"]),
		);
	return undefined;
}

export function systemMapValue(config: Config) {
	if (!config.systemMap || !config.enableSystem || !canUseExtended(config)) return undefined;
	const light = config.themes.includes(config.systemLight)
		? config.systemLight
		: config.themes[0];
	const dark = config.themes.includes(config.systemDark)
		? config.systemDark
		: config.themes.at(-1);
	return light && dark ? { light, dark } : undefined;
}

type Ref = { ref: string };
type PropValue = string | boolean | readonly string[] | Record<string, string> | Ref;
type Prop = [name: string, value: PropValue];

const isRef = (value: PropValue): value is Ref =>
	typeof value === "object" && !Array.isArray(value) && "ref" in value;

const quote = (text: string) => JSON.stringify(text);
const key = (name: string) => (/^[A-Za-z_$][\w$]*$/.test(name) ? name : quote(name));

const PRINT_WIDTH = 80;

const width = (text: string) => text.replaceAll("\t", "  ").length;

function expression(value: PropValue, indent = "", prefix = 0): string {
	if (isRef(value)) return value.ref;
	if (typeof value === "string") return quote(value);
	if (typeof value === "boolean") return String(value);
	const items = Array.isArray(value)
		? value.map(quote)
		: Object.entries(value as Record<string, string>).map(
				([name, item]) => `${key(name)}: ${quote(item)}`,
			);
	const [open, close] = Array.isArray(value) ? ["[", "]"] : ["{ ", " }"];
	const inline = `${open}${items.join(", ")}${close}`;
	if (width(indent) + prefix + inline.length <= PRINT_WIDTH) return inline;
	return [
		open.trim(),
		...items.map((item) => `${indent}\t${item},`),
		`${indent}${close.trim()}`,
	].join("\n");
}

function jsxAttribute([name, value]: Prop, indent = "") {
	if (value === true) return name;
	if (typeof value === "string") return `${name}=${quote(value)}`;
	return `${name}={${expression(value, indent, name.length + 3)}}`;
}

function jsxElement(tag: string, props: Prop[], indent: string, child: string) {
	const inline = `${indent}<${tag}${props.map((prop) => ` ${jsxAttribute(prop)}`).join("")}>${child}</${tag}>`;
	if (props.length <= 1 && width(inline) <= PRINT_WIDTH) return inline;
	return [
		`${indent}<${tag}`,
		...props.map((prop) => `${indent}\t${jsxAttribute(prop, `${indent}\t`)}`),
		`${indent}>`,
		`${indent}\t${child}`,
		`${indent}</${tag}>`,
	].join("\n");
}

function objectLiteral(props: Prop[], indent: string) {
	return [
		"{",
		...props.map(([name, value]) =>
			isRef(value) && value.ref === name
				? `${indent}\t${name},`
				: `${indent}\t${key(name)}: ${expression(value, `${indent}\t`, key(name).length + 2)},`,
		),
		`${indent}}`,
	].join("\n");
}

function htmlOpen(attributes: string[]) {
	const inline = `\t\t<html ${attributes.join(" ")}>`;
	if (width(inline) <= PRINT_WIDTH) return inline;
	return ["\t\t<html", ...attributes.map((item) => `\t\t\t${item}`), "\t\t>"].join("\n");
}

function sharedProps(config: Config, themesRef: string | undefined): Prop[] {
	const props: Prop[] = [];
	const themesChanged = config.themes.join() !== DEFAULT_THEMES.join();
	if (themesRef) props.push(["themes", { ref: themesRef }]);
	else if (themesChanged) props.push(["themes", config.themes]);

	const fallback = config.enableSystem ? "system" : config.themes[0];
	const preferred = effectiveDefault(config);
	if (preferred !== fallback) props.push(["defaultTheme", preferred]);
	if (!config.enableSystem) props.push(["enableSystem", false]);
	if (config.followSystem && config.enableSystem) props.push(["followSystem", true]);
	if (config.forcedTheme && config.themes.includes(config.forcedTheme))
		props.push(["forcedTheme", config.forcedTheme]);

	const attribute = attributeValue(config);
	if (attribute !== "class") props.push(["attribute", attribute]);
	const values = valueMap(config);
	if (values) props.push(["value", values]);
	const target = targetValue(config);
	if (target !== "html") props.push(["target", target]);

	if (config.storage !== "localStorage") props.push(["storage", config.storage]);
	if (config.storageKey.trim() && config.storageKey.trim() !== "theme")
		props.push(["storageKey", config.storageKey.trim()]);

	const themeColor = themeColorValue(config);
	if (themeColor) props.push(["themeColor", themeColor]);
	if (config.disableTransition) props.push(["disableTransitionOnChange", true]);
	if (!config.enableColorScheme) props.push(["enableColorScheme", false]);
	return props;
}

function cookieProps(config: Config): Prop[] {
	if (!usesCookie(config)) return [];
	const options: Record<string, string> = {};
	if (config.sameSite !== "Lax") options.sameSite = config.sameSite;
	if (config.cookieDomain.trim()) options.domain = config.cookieDomain.trim();
	return Object.keys(options).length ? [["cookieOptions", options]] : [];
}

function extendedProps(config: Config): Prop[] {
	if (!canUseExtended(config)) return [];
	const props: Prop[] = [];
	if (config.sameDocumentSync && config.storage !== "none")
		props.push(["enableSameDocumentSync", true]);
	const map = systemMapValue(config);
	if (map) props.push(["systemThemeMap", map]);
	return props;
}

function usesExtended(config: Config) {
	return extendedProps(config).length > 0;
}

function themesTuple(config: Config) {
	return `[${config.themes.map(quote).join(", ")}] as const`;
}

function htmlAttributes(config: Config) {
	if (!config.serverTheme || !canUseServerTheme(config)) return [];
	if (targetValue(config) !== "html" || valueMap(config) || config.forcedTheme) return [];
	const value = config.enableSystem ? `theme === "system" ? undefined : theme` : "theme";
	const attribute = attributeValue(config);
	const names = Array.isArray(attribute) ? attribute : [attribute];
	return names.map((name) => `${name === "class" ? "className" : name}={${value}}`);
}

function getThemeCall(config: Config) {
	const options = ["themes"];
	const preferred = effectiveDefault(config);
	if (preferred !== "system") options.push(`defaultTheme: ${quote(preferred)}`);
	if (config.storageKey.trim() && config.storageKey.trim() !== "theme")
		options.push(`storageKey: ${quote(config.storageKey.trim())}`);
	return `const theme = await getTheme({ ${options.join(", ")} });`;
}

function layoutShell({
	imports,
	preamble,
	async,
	body,
	html,
	provider,
}: {
	imports: string[];
	preamble: string[];
	async: boolean;
	body: string[];
	html: string[];
	provider: string;
}) {
	return [
		...imports,
		"",
		...(preamble.length ? [...preamble, ""] : []),
		`export default ${async ? "async " : ""}function RootLayout({`,
		"\tchildren,",
		"}: {",
		"\tchildren: React.ReactNode;",
		"}) {",
		...body.map((line) => `\t${line}`),
		...(body.length ? [""] : []),
		"\treturn (",
		htmlOpen(['lang="en"', ...html, "suppressHydrationWarning"]),
		"\t\t\t<body>",
		provider,
		"\t\t\t</body>",
		"\t\t</html>",
		"\t);",
		"}",
		"",
	].join("\n");
}

function nextFiles(config: Config): GeneratedFile[] {
	const server = config.serverTheme && canUseServerTheme(config);
	const css = config.tailwind ? ['import "./globals.css";'] : [];
	const files: GeneratedFile[] = [];

	if (config.factory) {
		const props = [...sharedProps(config, "themes"), ...cookieProps(config)];
		files.push({
			path: "app/themes.ts",
			lang: "ts",
			code: `export const themes = ${themesTuple(config)};\n\nexport type AppTheme = (typeof themes)[number];\n`,
		});
		files.push({
			path: "app/theme.ts",
			lang: "ts",
			code: [
				'"use client";',
				"",
				'import { createThemes } from "@wrksz/themes/next/create-themes";',
				'import { themes } from "./themes";',
				"",
				"export const {",
				"\tNextThemeProvider,",
				"\tuseTheme,",
				"\tuseThemeValue,",
				"\tuseThemeEffect,",
				"\tThemedImage,",
				`} = createThemes(${objectLiteral(props, "")});`,
				"",
			].join("\n"),
		});
		files.push({
			path: "app/layout.tsx",
			lang: "tsx",
			code: layoutShell({
				imports: [
					...(server ? ['import { getTheme } from "@wrksz/themes/next";'] : []),
					'import { NextThemeProvider } from "./theme";',
					...(server ? ['import { themes } from "./themes";'] : []),
					...css,
				],
				preamble: server ? ["export const instant = false;"] : [],
				async: server,
				body: server ? [getThemeCall(config)] : [],
				html: htmlAttributes(config),
				provider: jsxElement(
					"NextThemeProvider",
					server ? [["initialTheme", { ref: "theme" }]] : [],
					"\t\t\t\t",
					"{children}",
				),
			}),
		});
		return files;
	}

	const extended = usesExtended(config);
	const needsThemes = server || config.themes.join() !== DEFAULT_THEMES.join();
	const props = [
		...sharedProps(config, needsThemes ? "themes" : undefined),
		...cookieProps(config),
		...extendedProps(config),
		...(server ? ([["initialTheme", { ref: "theme" }]] as Prop[]) : []),
	];
	const entry = extended ? "@wrksz/themes/next/extended" : "@wrksz/themes/next";
	const imports =
		server && !extended
			? [`import { getTheme, ThemeProvider } from "${entry}";`]
			: [
					...(server ? ['import { getTheme } from "@wrksz/themes/next";'] : []),
					`import { ThemeProvider } from "${entry}";`,
				];

	files.push({
		path: "app/layout.tsx",
		lang: "tsx",
		code: layoutShell({
			imports: [...imports, ...css],
			preamble: [
				...(server ? ["export const instant = false;"] : []),
				...(server && needsThemes ? [""] : []),
				...(needsThemes ? [`const themes = ${themesTuple(config)};`] : []),
			],
			async: server,
			body: server ? [getThemeCall(config)] : [],
			html: htmlAttributes(config),
			provider: jsxElement("ThemeProvider", props, "\t\t\t\t", "{children}"),
		}),
	});
	return files;
}

function ssrFiles(config: Config): GeneratedFile[] {
	const props = sharedProps(config, undefined).filter(([name]) => name !== "themes");
	const files: GeneratedFile[] = [
		{
			path: "app/theme-config.ts",
			lang: "ts",
			code: `export const themeConfig = ${objectLiteral(
				[["themes", { ref: themesTuple(config).replace(" as const", "") }], ...props],
				"",
			)} as const;\n`,
		},
	];
	const cookies = cookieProps(config);

	if (config.factory)
		files.push({
			path: "app/theme.ts",
			lang: "ts",
			code: [
				'"use client";',
				"",
				'import { createThemes } from "@wrksz/themes/client";',
				'import { themeConfig } from "./theme-config";',
				"",
				"export const { ThemeProvider, useTheme, useThemeValue, useThemeEffect, ThemedImage } =",
				cookies.length
					? `\tcreateThemes({\n\t\t...themeConfig,\n\t\tcookieOptions: ${expression(cookies[0][1], "\t\t", 15)},\n\t});`
					: "\tcreateThemes(themeConfig);",
				"",
			].join("\n"),
		});

	const providerProps: Prop[] = config.factory ? [] : [["{...themeConfig}", true], ...cookies];
	files.push({
		path: "app/root.tsx",
		lang: "tsx",
		code: [
			...(config.factory ? [] : ['import { ThemeProvider } from "@wrksz/themes";']),
			'import { ThemeScript } from "@wrksz/themes/script";',
			...(config.factory ? ['import { ThemeProvider } from "./theme";'] : []),
			'import { themeConfig } from "./theme-config";',
			...(config.tailwind ? ['import "./globals.css";'] : []),
			"",
			"export function Document({ children }: { children: React.ReactNode }) {",
			"\treturn (",
			'\t\t<html lang="en" suppressHydrationWarning>',
			"\t\t\t<head>",
			"\t\t\t\t<ThemeScript {...themeConfig} />",
			"\t\t\t</head>",
			"\t\t\t<body>",
			jsxElement("ThemeProvider", providerProps, "\t\t\t\t", "{children}"),
			"\t\t\t</body>",
			"\t\t</html>",
			"\t);",
			"}",
			"",
		].join("\n"),
	});
	return files;
}

function cssIdentifier(name: string) {
	return name.replace(/[^a-z0-9-]/gi, "-");
}

function selectorFor(config: Config, theme: string) {
	const mapped = valueMap(config)?.[theme] ?? theme;
	const attribute = attributeValue(config);
	const primary = Array.isArray(attribute) ? attribute[0] : attribute;
	if (primary === "class") return `.${cssIdentifier(mapped.split(/\s+/)[0])}`;
	return `[${primary}=${quote(mapped)}]`;
}

function tailwindFile(config: Config): GeneratedFile {
	const variant = (name: string, theme: string) => {
		const selector = selectorFor(config, theme);
		return `@custom-variant ${cssIdentifier(name)} (&:where(${selector}, ${selector} *));`;
	};
	const map = systemMapValue(config);
	const variants = [
		...(map && !config.themes.includes("dark") ? [variant("dark", map.dark)] : []),
		...config.themes.filter((theme) => theme !== "light").map((theme) => variant(theme, theme)),
	];
	return {
		path: "app/globals.css",
		lang: "css",
		code: ['@import "tailwindcss";', "", ...variants, ""].join("\n"),
	};
}

function switcherFile(config: Config): GeneratedFile {
	const options = config.enableSystem ? ["system", ...config.themes] : config.themes;
	const typed = config.factory;
	const imports = typed
		? [
				'import { useHydrated } from "@wrksz/themes/client";',
				'import { useTheme } from "@/app/theme";',
			]
		: ['import { useHydrated, useTheme } from "@wrksz/themes/client";'];
	const hook = typed ? "useTheme()" : `useTheme<${config.themes.map(quote).join(" | ")}>()`;

	return {
		path: "components/theme-switch.tsx",
		lang: "tsx",
		code: [
			'"use client";',
			"",
			...imports,
			"",
			`const options = [${options.map(quote).join(", ")}] as const;`,
			"",
			"export function ThemeSwitch() {",
			`\tconst { theme, setTheme, forcedTheme } = ${hook};`,
			"\tconst hydrated = useHydrated();",
			"",
			"\treturn (",
			"\t\t<select",
			'\t\t\taria-label="Theme"',
			"\t\t\tdisabled={Boolean(forcedTheme)}",
			"\t\t\tvalue={hydrated ? (theme ?? options[0]) : options[0]}",
			"\t\t\tonChange={(event) => setTheme(event.target.value as (typeof options)[number])}",
			"\t\t>",
			"\t\t\t{options.map((option) => (",
			"\t\t\t\t<option key={option} value={option}>",
			"\t\t\t\t\t{option}",
			"\t\t\t\t</option>",
			"\t\t\t))}",
			"\t\t</select>",
			"\t);",
			"}",
			"",
		].join("\n"),
	};
}

export function generate(config: Config): GeneratedFile[] {
	const files = config.framework === "next" ? nextFiles(config) : ssrFiles(config);
	if (config.switcher) files.push(switcherFile(config));
	if (config.tailwind) files.push(tailwindFile(config));
	return files;
}
