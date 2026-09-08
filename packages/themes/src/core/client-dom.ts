import type { Attribute, ThemeColor } from "./types.js";

export { getDomWindow, readStoredTheme, writeStoredTheme } from "./theme-storage.js";

type ApplyThemeOptions = {
	resolved: string;
	attribute: Attribute | readonly Attribute[];
	themes: readonly string[];
	valueMap: Partial<Record<string, string>> | undefined;
	target: string;
	disableTransitionOnChange: boolean | string;
	enableColorScheme: boolean;
	themeColor: ThemeColor | undefined;
};

const LAST_CLASS_TOKENS = "_";
const CREATED_THEME_COLOR = "$";

type ThemedElement = Element & { [LAST_CLASS_TOKENS]?: string[] };
type MarkedThemeColorMeta = HTMLMetaElement & { [CREATED_THEME_COLOR]?: 1 };

function resolveThemeColor(themeColor: ThemeColor, resolved: string): string | undefined {
	if (typeof themeColor === "string") return themeColor;
	return themeColor[resolved];
}

function splitClassTokens(value: string): string[] {
	return value.split(" ").filter((t) => t);
}

function updateMetaThemeColor(color: string | undefined): void {
	let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
	if (!color) {
		if (!meta) return;
		if ((meta as MarkedThemeColorMeta)[CREATED_THEME_COLOR]) meta.remove();
		else meta.removeAttribute("content");
		return;
	}
	if (!meta) {
		meta = document.createElement("meta");
		meta.name = "theme-color";
		document.head.appendChild(meta);
		(meta as MarkedThemeColorMeta)[CREATED_THEME_COLOR] = 1;
	}
	meta.content = color;
}

function getTargetEl(target: string): Element | null {
	if (target === "html") return document.documentElement;
	if (target === "body") return document.body;
	return document.querySelector(target);
}

export function applyThemeToDom({
	resolved,
	attribute,
	themes,
	valueMap,
	target,
	disableTransitionOnChange,
	enableColorScheme,
	themeColor,
}: ApplyThemeOptions): void {
	const el = getTargetEl(target);
	if (!el) return;

	const attrValue = valueMap?.[resolved] ?? resolved;
	const attrs = ([] as Attribute[]).concat(attribute);
	const classValues = themes.flatMap((t) => splitClassTokens(valueMap?.[t] ?? t));
	const nextClassValues = splitClassTokens(attrValue);
	const themed = el as ThemedElement;
	const removeClassValues = themed[LAST_CLASS_TOKENS] ?? classValues;
	const nextAttrValue = attrValue || null;
	let needsUpdate = false;
	let classChanged = false;
	for (const attr of attrs) {
		if (attr === "class") {
			classChanged =
				removeClassValues.some(
					(token) => !nextClassValues.includes(token) && el.classList.contains(token),
				) || nextClassValues.some((token) => !el.classList.contains(token));
			needsUpdate ||= classChanged;
		} else {
			needsUpdate ||= el.getAttribute(attr) !== nextAttrValue;
		}
	}

	if (needsUpdate && disableTransitionOnChange) {
		const transitionValue =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = `*,*::before,*::after{transition:${transitionValue}!important}`;
		document.head.appendChild(style);
		requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
	}

	for (const attr of attrs) {
		if (attr === "class") {
			if (classChanged) {
				el.classList.remove(...removeClassValues);
				el.classList.add(...nextClassValues);
			}
			themed[LAST_CLASS_TOKENS] = nextClassValues;
		} else if (el.getAttribute(attr) !== nextAttrValue) {
			if (nextAttrValue) el.setAttribute(attr, nextAttrValue);
			else el.removeAttribute(attr);
		}
	}

	if (enableColorScheme) {
		(el as HTMLElement).style.colorScheme =
			resolved === "light" || resolved === "dark" ? resolved : "";
	}

	if (themeColor) {
		updateMetaThemeColor(resolveThemeColor(themeColor, resolved));
	}
}
