import type { SystemThemeMap } from "./extended-types.js";
import type { ScriptConfig } from "./script.js";

export type ExtendedScriptConfig = ScriptConfig & {
	systemThemeMap: SystemThemeMap<string> | undefined;
};

function extendedThemeScript(
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
	systemThemeMap:
		| { light: string; dark: string }
		| Record<string, { light: string; dark: string }>
		| null,
): void {
	let selection: string;

	if (forcedTheme) {
		selection = forcedTheme;
	} else if (
		initialTheme &&
		(themes.includes(initialTheme) || (enableSystem && initialTheme === "system"))
	) {
		selection = initialTheme;
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
		selection =
			stored && (themes.includes(stored) || (enableSystem && stored === "system"))
				? stored
				: defaultTheme;
	}

	const systemTheme = enableSystem
		? matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light"
		: null;
	let theme = selection;

	if (systemTheme) {
		const directMap = systemThemeMap as { light?: unknown; dark?: unknown } | null;
		if (
			directMap &&
			typeof directMap.light === "string" &&
			typeof directMap.dark === "string"
		) {
			if (selection === "system")
				theme = (directMap as { light: string; dark: string })[systemTheme];
		} else if (systemThemeMap && selection !== "system") {
			const variantMap = systemThemeMap as Record<
				string,
				{ light: string; dark: string } | undefined
			>;
			theme = variantMap[selection]?.[systemTheme] ?? selection;
		} else if (selection === "system") {
			theme = systemTheme;
		}
	} else if (selection === "system") {
		theme = defaultTheme;
	}

	const attributeValue = value?.[theme] || theme;
	const element: Element | null =
		target === "html"
			? document.documentElement
			: target === "body"
				? document.body
				: document.querySelector(target);
	if (!element) return;

	const attributes = Array.isArray(attribute) ? attribute : [attribute];
	const toRemove = themes.flatMap((current) => (value?.[current] || current).split(" "));
	const toAdd = attributeValue.split(" ");
	let changed = false;
	let classChanged = false;

	for (const current of attributes) {
		if (current === "class") {
			classChanged =
				toRemove.some(
					(token) => !toAdd.includes(token) && element.classList.contains(token),
				) || toAdd.some((token) => !element.classList.contains(token));
			changed = changed || classChanged;
		} else {
			changed = changed || element.getAttribute(current) !== attributeValue;
		}
	}

	if (changed && disableTransitionOnChange) {
		const css =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = `*,*::before,*::after{transition:${css}!important}`;
		document.head.appendChild(style);
		requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
	}

	for (const current of attributes) {
		if (current === "class") {
			if (classChanged) {
				element.classList.remove(...toRemove);
				element.classList.add(...toAdd);
			}
		} else if (attributeValue) {
			if (element.getAttribute(current) !== attributeValue)
				element.setAttribute(current, attributeValue);
		} else {
			element.removeAttribute(current);
		}
	}

	if (enableColorScheme && (theme === "light" || theme === "dark"))
		(element as HTMLElement).style.colorScheme = theme;

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

function safeJson(value: unknown): string {
	return (JSON.stringify(value) as string)
		.replace(/</g, "\\u003c")
		.replace(/\u2028/g, "\\u2028")
		.replace(/\u2029/g, "\\u2029");
}

export function getExtendedScript(config: ExtendedScriptConfig): string {
	const fn = extendedThemeScript.toString().replace(/\s*__name\s*\([^)]*\)\s*;?\s*/g, "");
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
		safeJson(config.systemThemeMap ?? null),
	].join(",");
	return `(${fn})(${args})`;
}
