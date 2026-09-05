/**
 * Readable bootstrap source of truth.
 *
 * Do not import this module from runtime package code — `scripts/generate-script-source.ts`
 * minifies it into `script-source.ts`, which is what `getScript` ships.
 *
 * Prefer string concatenation over template literals so the minified shipped source stays
 * free of `${...}` placeholders inside a normal string constant.
 */
export function themeBootstrap(
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
	const isValid = (name: string) => themes.includes(name) || (enableSystem && name === "system");

	if (forcedTheme && themes.includes(forcedTheme)) {
		theme = forcedTheme;
	} else if (initialTheme && isValid(initialTheme)) {
		theme = initialTheme;
	} else {
		let stored: string | null = null;

		if (!followSystem) {
			try {
				if (storage === "cookie" || storage === "hybrid") {
					const parts = ("; " + document.cookie).split("; " + storageKey + "=");
					const encoded = parts.length > 1 ? parts.pop()?.split(";")[0] : null;
					let fromCookie: string | null = null;
					try {
						fromCookie = encoded ? decodeURIComponent(encoded) || null : null;
					} catch {}
					stored =
						storage === "hybrid"
							? (fromCookie ?? localStorage.getItem(storageKey))
							: fromCookie;
				} else if (storage !== "none") {
					stored = (storage === "localStorage" ? localStorage : sessionStorage).getItem(
						storageKey,
					);
				}
			} catch {}
		}

		theme = stored && isValid(stored) ? stored : defaultTheme;
	}

	if (theme === "system") {
		theme = enableSystem
			? matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light"
			: defaultTheme;
	}

	const attrValue = value?.[theme] ?? theme;
	const el =
		target === "html"
			? document.documentElement
			: target === "body"
				? document.body
				: document.querySelector(target);

	if (!el) return;

	const attrs = Array.isArray(attribute) ? attribute : [attribute];
	const toRemove = themes.flatMap((name) => (value?.[name] ?? name).split(" ").filter(Boolean));
	const toAdd = attrValue.split(" ").filter(Boolean);
	const nextAttrValue = attrValue || null;
	let changed = false;
	let classChanged = false;

	for (const attr of attrs) {
		if (attr === "class") {
			classChanged =
				toRemove.some((token) => !toAdd.includes(token) && el.classList.contains(token)) ||
				toAdd.some((token) => !el.classList.contains(token));
			changed = changed || classChanged;
		} else {
			changed = changed || el.getAttribute(attr) !== nextAttrValue;
		}
	}

	if (changed && disableTransitionOnChange) {
		const css =
			typeof disableTransitionOnChange === "string" ? disableTransitionOnChange : "none";
		const style = document.createElement("style");
		style.textContent = "*,*::before,*::after{transition:" + css + "!important}";
		document.head.appendChild(style);
		requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
	}

	for (const attr of attrs) {
		if (attr === "class") {
			if (classChanged) {
				el.classList.remove(...toRemove);
				el.classList.add(...toAdd);
			}
		} else if (el.getAttribute(attr) !== nextAttrValue) {
			if (nextAttrValue) el.setAttribute(attr, nextAttrValue);
			else el.removeAttribute(attr);
		}
	}

	if (enableColorScheme) {
		(el as HTMLElement).style.colorScheme = theme === "light" || theme === "dark" ? theme : "";
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
