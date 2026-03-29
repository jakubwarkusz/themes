import type { Attribute, StorageType } from "./types.js";

export type ScriptConfig = {
	storageKey: string;
	attribute: Attribute | Attribute[];
	defaultTheme: string;
	enableSystem: boolean;
	enableColorScheme: boolean;
	forcedTheme: string | undefined;
	themes: string[];
	value: Record<string, string> | undefined;
	target: string;
	storage: StorageType;
	themeColors: string | Partial<Record<string, string>> | undefined;
	initialTheme: string | undefined;
	disableTransitionOnChange: boolean | string;
};

/**
 * Runs inline in <head>, before React hydrates.
 * Params are passed explicitly when serialized via getScript().
 */
function themeScript(
	storageKey: string,
	attribute: string | string[],
	defaultTheme: string,
	enableSystem: boolean,
	enableColorScheme: boolean,
	forcedTheme: string | null,
	themes: string[],
	value: Record<string, string> | null,
	target: string,
	storage: string,
	themeColors: string | Record<string, string> | null,
	initialTheme: string | null,
	disableTransitionOnChange: boolean | string,
): void {
	if (disableTransitionOnChange) {
		const css =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = `*,*::before,*::after{transition:${css}!important}`;
		document.head.appendChild(style);
		requestAnimationFrame(() => requestAnimationFrame(() => document.head.removeChild(style)));
	}

	let theme: string;

	if (forcedTheme) {
		theme = forcedTheme;
	} else if (initialTheme && themes.includes(initialTheme)) {
		theme = initialTheme;
	} else {
		let stored: string | null = null;

		try {
			if (storage === "cookie") {
				const re = new RegExp(
					"(?:^|;\\s*)" + storageKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)",
				);
				const match = document.cookie.match(re);
				stored = match?.[1] != null ? decodeURIComponent(match[1]) : null;
			} else if (storage !== "none") {
				const store = storage === "localStorage" ? localStorage : sessionStorage;
				stored = store.getItem(storageKey);
			}
		} catch {}

		theme =
			stored && (themes.includes(stored) || (enableSystem && stored === "system"))
				? stored
				: defaultTheme;
	}

	if (theme === "system") {
		theme = enableSystem
			? matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: defaultTheme;
	}

	const attrValue = value?.[theme] || theme;

	const el: Element | null =
		target === "html"
			? document.documentElement
			: target === "body"
				? document.body
				: document.querySelector(target);

	if (!el) return;

	const attrs = Array.isArray(attribute) ? attribute : [attribute];

	for (const attr of attrs) {
		if (attr === "class") {
			const toRemove = themes.flatMap((t) => (value?.[t] || t).split(" "));
			el.classList.remove(...toRemove);
			el.classList.add(...attrValue.split(" "));
		} else {
			if (attrValue) {
				el.setAttribute(attr, attrValue);
			} else {
				el.removeAttribute(attr);
			}
		}
	}

	if (enableColorScheme && (theme === "light" || theme === "dark")) {
		(el as HTMLElement).style.colorScheme = theme;
	}

	if (themeColors) {
		const color = typeof themeColors === "string" ? themeColors : themeColors[theme];
		if (color) {
			let meta = document.querySelector('meta[name="theme-color"]');
			if (!meta) {
				meta = document.createElement("meta");
				meta.setAttribute("name", "theme-color");
				document.head.appendChild(meta);
			}
			meta.setAttribute("content", color);
		}
	}
}

/**
 * Serializes themeScript into an IIFE string safe for injection into <script>.
 */
export function getScript(config: ScriptConfig): string {
	const fn = themeScript.toString().replace(/\s*__name\s*\([^)]*\)\s*;?\s*/g, "");

	const args = [
		JSON.stringify(config.storageKey),
		JSON.stringify(config.attribute),
		JSON.stringify(config.defaultTheme),
		String(config.enableSystem),
		String(config.enableColorScheme),
		JSON.stringify(config.forcedTheme ?? null),
		JSON.stringify(config.themes),
		JSON.stringify(config.value ?? null),
		JSON.stringify(config.target),
		JSON.stringify(config.storage),
		JSON.stringify(config.themeColors ?? null),
		JSON.stringify(config.initialTheme ?? null),
		JSON.stringify(config.disableTransitionOnChange),
	].join(",");

	return `(${fn})(${args})`;
}
