import type { Attribute, StorageType } from "./types.js";

export type ScriptConfig = {
	storageKey: string;
	attribute: Attribute | readonly Attribute[];
	defaultTheme: string;
	enableSystem: boolean;
	enableColorScheme: boolean;
	forcedTheme: string | undefined;
	themes: readonly string[];
	value: Partial<Record<string, string>> | undefined;
	target: string;
	storage: StorageType;
	themeColors: string | Partial<Record<string, string>> | undefined;
	initialTheme: string | undefined;
	disableTransitionOnChange: boolean | string;
	followSystem: boolean;
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
	followSystem: boolean,
): void {
	let theme: string;

	if (forcedTheme) {
		theme = forcedTheme;
	} else if (initialTheme && themes.includes(initialTheme)) {
		theme = initialTheme;
	} else {
		let stored: string | null = null;

		if (!followSystem) {
			try {
				if (storage === "cookie" || storage === "hybrid") {
					const parts = `; ${document.cookie}`.split(`; ${storageKey}=`);
					const encoded = parts.length > 1 ? parts.pop()?.split(";")[0] : null;
					const fromCookie = encoded ? decodeURIComponent(encoded) : null;
					stored =
						storage === "hybrid"
							? (fromCookie ?? localStorage.getItem(storageKey))
							: fromCookie;
				} else if (storage !== "none") {
					const store = storage === "localStorage" ? localStorage : sessionStorage;
					stored = store.getItem(storageKey);
				}
			} catch {}
		}

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
	const toRemove = themes.flatMap((t) => (value?.[t] || t).split(" "));
	const toAdd = attrValue.split(" ");
	let changed = false;
	let classChanged = false;

	for (const attr of attrs) {
		if (attr === "class") {
			classChanged =
				toRemove.some((token) => !toAdd.includes(token) && el.classList.contains(token)) ||
				toAdd.some((token) => !el.classList.contains(token));
			changed = changed || classChanged;
		} else {
			changed = changed || el.getAttribute(attr) !== attrValue;
		}
	}

	if (changed && disableTransitionOnChange) {
		const css =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = `*,*::before,*::after{transition:${css}!important}`;
		document.head.appendChild(style);
		requestAnimationFrame(() => requestAnimationFrame(() => document.head.removeChild(style)));
	}

	for (const attr of attrs) {
		if (attr === "class") {
			if (classChanged) {
				el.classList.remove(...toRemove);
				el.classList.add(...toAdd);
			}
		} else if (attrValue) {
			if (el.getAttribute(attr) !== attrValue) {
				el.setAttribute(attr, attrValue);
			}
		} else {
			el.removeAttribute(attr);
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
function safeJson(value: unknown): string {
	return (JSON.stringify(value) as string)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

export function getScript(config: ScriptConfig): string {
	const fn = themeScript.toString().replace(/\s*__name\s*\([^)]*\)\s*;?\s*/g, "");

	const args = [
		safeJson(config.storageKey),
		safeJson(config.attribute),
		safeJson(config.defaultTheme),
		String(config.enableSystem),
		String(config.enableColorScheme),
		safeJson(config.forcedTheme ?? null),
		safeJson(config.themes),
		safeJson(config.value ?? null),
		safeJson(config.target),
		safeJson(config.storage),
		safeJson(config.themeColors ?? null),
		safeJson(config.initialTheme ?? null),
		safeJson(config.disableTransitionOnChange),
		String(config.followSystem),
	].join(",");

	return `(${fn})(${args})`;
}
