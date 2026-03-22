import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { useTheme } from "../core/context.js";
import { ClientThemeProvider } from "../providers/client-provider.js";
import { clearCookies } from "./setup.js";

(globalThis as unknown as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

function ThemeConsumer({ prefix = "" }: { prefix?: string }) {
	const { theme, resolvedTheme, systemTheme, forcedTheme, setTheme } = useTheme();
	return (
		<div>
			<span data-testid={`${prefix}theme`}>{theme ?? "-"}</span>
			<span data-testid={`${prefix}resolved`}>{resolvedTheme ?? "-"}</span>
			<span data-testid={`${prefix}system`}>{systemTheme ?? "-"}</span>
			<span data-testid={`${prefix}forced`}>{forcedTheme ?? "-"}</span>
			<button
				type="button"
				data-testid={`${prefix}btn-dark`}
				onClick={() => setTheme("dark")}
			>
				{prefix}dark
			</button>
			<button
				type="button"
				data-testid={`${prefix}btn-light`}
				onClick={() => setTheme("light")}
			>
				{prefix}light
			</button>
			<button
				type="button"
				data-testid={`${prefix}btn-system`}
				onClick={() => setTheme("system")}
			>
				{prefix}system
			</button>
		</div>
	);
}

function dispatchStorageEvent(key: string, newValue: string | null) {
	const StorageEventCtor = (window as Window & { StorageEvent: typeof StorageEvent })
		.StorageEvent;
	const event = new StorageEventCtor("storage", { key, newValue, storageArea: localStorage });
	window.dispatchEvent(event);
}

type MQL = {
	matches: boolean;
	addEventListener: (type: string, fn: EventListener) => void;
	removeEventListener: (type: string, fn: EventListener) => void;
	dispatchChange: (matches: boolean) => void;
};

function mockMatchMedia(prefersDark: boolean): MQL {
	const listeners = new Set<(e: Partial<MediaQueryListEvent>) => void>();
	const mql: MQL = {
		matches: prefersDark,
		addEventListener: (_type: string, fn: EventListener) =>
			listeners.add(fn as (e: Partial<MediaQueryListEvent>) => void),
		removeEventListener: (_type: string, fn: EventListener) =>
			listeners.delete(fn as (e: Partial<MediaQueryListEvent>) => void),
		dispatchChange: (matches: boolean) => {
			mql.matches = matches;
			for (const fn of listeners) fn({ matches } as Partial<MediaQueryListEvent>);
		},
	};
	window.matchMedia = () => mql as unknown as MediaQueryList;
	return mql;
}

function wrap(
	children: ReactNode,
	props: Omit<Parameters<typeof ClientThemeProvider>[0], "children"> = {},
) {
	return render(<ClientThemeProvider {...props}>{children}</ClientThemeProvider>);
}

beforeEach(() => {
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	localStorage.clear();
	sessionStorage.clear();
	clearCookies();
	mockMatchMedia(false);
});

afterEach(() => {
	cleanup();
	localStorage.clear();
	sessionStorage.clear();
	clearCookies();
});

describe("ClientThemeProvider - basic", () => {
	test("renders children", () => {
		wrap(<span data-testid="child">hello</span>);
		expect(screen.getByTestId("child").textContent).toBe("hello");
	});

	test("defaults to system theme, resolves via matchMedia", () => {
		mockMatchMedia(true);
		wrap(<ThemeConsumer />);
		expect(screen.getByTestId("theme").textContent).toBe("system");
		expect(screen.getByTestId("resolved").textContent).toBe("dark");
		expect(screen.getByTestId("system").textContent).toBe("dark");
	});

	test("reads stored theme from localStorage", () => {
		localStorage.setItem("theme", "dark");
		wrap(<ThemeConsumer />);
		expect(screen.getByTestId("theme").textContent).toBe("dark");
		expect(screen.getByTestId("resolved").textContent).toBe("dark");
	});

	test("applies class to documentElement on mount", () => {
		localStorage.setItem("theme", "dark");
		wrap(<ThemeConsumer />);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("ignores invalid localStorage value and falls back to default", () => {
		localStorage.setItem("theme", "invalid");
		wrap(<ThemeConsumer />);
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});
});

describe("ClientThemeProvider - setTheme", () => {
	test("updates context value", () => {
		wrap(<ThemeConsumer />);
		act(() => {
			fireEvent.click(screen.getByTestId("btn-dark"));
		});
		expect(screen.getByTestId("theme").textContent).toBe("dark");
		expect(screen.getByTestId("resolved").textContent).toBe("dark");
	});

	test("applies class to documentElement", () => {
		wrap(<ThemeConsumer />);
		act(() => {
			fireEvent.click(screen.getByTestId("btn-dark"));
		});
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("light")).toBe(false);
	});

	test("saves to localStorage", () => {
		wrap(<ThemeConsumer />);
		act(() => {
			fireEvent.click(screen.getByTestId("btn-dark"));
		});
		expect(localStorage.getItem("theme")).toBe("dark");
	});

	test("resolves system when setTheme('system') called", () => {
		mockMatchMedia(true);
		localStorage.setItem("theme", "light");
		wrap(<ThemeConsumer />);
		act(() => {
			fireEvent.click(screen.getByTestId("btn-system"));
		});
		expect(screen.getByTestId("theme").textContent).toBe("system");
		expect(screen.getByTestId("resolved").textContent).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("respects custom storageKey", () => {
		wrap(<ThemeConsumer />, { storageKey: "app-theme" });
		act(() => {
			fireEvent.click(screen.getByTestId("btn-dark"));
		});
		expect(localStorage.getItem("app-theme")).toBe("dark");
		expect(localStorage.getItem("theme")).toBeNull();
	});

	test("does not write to storage when storage='none'", () => {
		wrap(<ThemeConsumer />, { storage: "none" });
		act(() => {
			fireEvent.click(screen.getByTestId("btn-dark"));
		});
		expect(localStorage.getItem("theme")).toBeNull();
	});
});

describe("ClientThemeProvider - forcedTheme", () => {
	test("applies forced theme to DOM on mount", () => {
		wrap(<ThemeConsumer />, { forcedTheme: "dark" });
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("exposes forcedTheme in context", () => {
		wrap(<ThemeConsumer />, { forcedTheme: "dark" });
		expect(screen.getByTestId("forced").textContent).toBe("dark");
	});

	test("setTheme is a no-op when forcedTheme is set", () => {
		wrap(<ThemeConsumer />, { forcedTheme: "dark" });
		act(() => {
			fireEvent.click(screen.getByTestId("btn-light"));
		});
		expect(screen.getByTestId("resolved").textContent).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("light")).toBe(false);
	});
});

describe("ClientThemeProvider - initialTheme", () => {
	test("overrides localStorage value on mount", () => {
		localStorage.setItem("theme", "light");
		wrap(<ThemeConsumer />, { initialTheme: "dark" });
		expect(screen.getByTestId("theme").textContent).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("syncs initialTheme to localStorage", () => {
		wrap(<ThemeConsumer />, { initialTheme: "dark" });
		expect(localStorage.getItem("theme")).toBe("dark");
	});

	test("setTheme works after initialTheme", () => {
		wrap(<ThemeConsumer />, { initialTheme: "dark" });
		act(() => {
			fireEvent.click(screen.getByTestId("btn-light"));
		});
		expect(screen.getByTestId("theme").textContent).toBe("light");
		expect(localStorage.getItem("theme")).toBe("light");
	});
});

describe("ClientThemeProvider - followSystem", () => {
	test("updates theme when system preference changes", () => {
		const mql = mockMatchMedia(false);
		localStorage.setItem("theme", "system");
		wrap(<ThemeConsumer />, { followSystem: true });

		act(() => {
			mql.dispatchChange(true);
		});

		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("follows system even after manual setTheme when followSystem=true", () => {
		const mql = mockMatchMedia(false);
		wrap(<ThemeConsumer />, { followSystem: true });

		act(() => {
			fireEvent.click(screen.getByTestId("btn-light"));
		});
		act(() => {
			mql.dispatchChange(true);
		});

		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("manual theme survives system change when followSystem=false", () => {
		const mql = mockMatchMedia(false);
		wrap(<ThemeConsumer />);

		act(() => {
			fireEvent.click(screen.getByTestId("btn-light"));
		});
		act(() => {
			mql.dispatchChange(true);
		});

		expect(document.documentElement.classList.contains("light")).toBe(true);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});

	test("ignores stored localStorage value on mount when followSystem=true", () => {
		mockMatchMedia(true);
		localStorage.setItem("theme", "light");
		wrap(<ThemeConsumer />, { followSystem: true });

		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.classList.contains("light")).toBe(false);
	});

	test("localStorage still used on mount when followSystem=false", () => {
		mockMatchMedia(true);
		localStorage.setItem("theme", "light");
		wrap(<ThemeConsumer />);

		expect(document.documentElement.classList.contains("light")).toBe(true);
		expect(document.documentElement.classList.contains("dark")).toBe(false);
	});
});

describe("ClientThemeProvider - onThemeChange", () => {
	test("fires when setTheme is called", () => {
		const calls: string[] = [];
		wrap(<ThemeConsumer />, { onThemeChange: (t) => calls.push(t) });
		act(() => {
			fireEvent.click(screen.getByTestId("btn-dark"));
		});
		expect(calls).toEqual(["dark"]);
	});

	test("fires with 'system' when setTheme('system') is called", () => {
		const calls: string[] = [];
		wrap(<ThemeConsumer />, { onThemeChange: (t) => calls.push(t) });
		act(() => {
			fireEvent.click(screen.getByTestId("btn-system"));
		});
		expect(calls).toEqual(["system"]);
	});

	test("fires with resolved theme when system preference changes", () => {
		const calls: string[] = [];
		const mql = mockMatchMedia(false);
		wrap(<ThemeConsumer />, { onThemeChange: (t) => calls.push(t) });

		act(() => {
			fireEvent.click(screen.getByTestId("btn-system"));
		});
		act(() => {
			mql.dispatchChange(true);
		});

		expect(calls).toEqual(["system", "dark"]);
	});
});

describe("ClientThemeProvider - nested providers", () => {
	test("each provider has independent theme state", () => {
		mockMatchMedia(false);
		render(
			<ClientThemeProvider storageKey="outer">
				<ThemeConsumer prefix="outer-" />
				<ClientThemeProvider storageKey="inner" forcedTheme="dark">
					<ThemeConsumer prefix="inner-" />
				</ClientThemeProvider>
			</ClientThemeProvider>,
		);

		act(() => {
			fireEvent.click(screen.getByTestId("outer-btn-light"));
		});

		expect(screen.getByTestId("outer-theme").textContent).toBe("light");
		expect(screen.getByTestId("inner-forced").textContent).toBe("dark");
	});
});

describe("ClientThemeProvider - cross-tab storage sync", () => {
	test("updates theme when storage event fires", () => {
		wrap(<ThemeConsumer />);

		act(() => {
			dispatchStorageEvent("theme", "dark");
		});

		expect(screen.getByTestId("theme").textContent).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("ignores storage event for different key", () => {
		localStorage.setItem("theme", "light");
		wrap(<ThemeConsumer />);

		act(() => {
			dispatchStorageEvent("other-key", "dark");
		});

		expect(screen.getByTestId("theme").textContent).toBe("light");
	});

	test("does not react to storage events when storage='sessionStorage'", () => {
		sessionStorage.setItem("theme", "light");
		wrap(<ThemeConsumer />, { storage: "sessionStorage" });

		act(() => {
			dispatchStorageEvent("theme", "dark");
		});

		expect(screen.getByTestId("theme").textContent).toBe("light");
	});
});

describe("ClientThemeProvider - cookie storage", () => {
	test("reads stored theme from cookie on mount", () => {
		document.cookie = "theme=dark; path=/";
		wrap(<ThemeConsumer />, { storage: "cookie" });
		expect(screen.getByTestId("theme").textContent).toBe("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("writes to cookie when setTheme is called", () => {
		wrap(<ThemeConsumer />, { storage: "cookie" });
		act(() => {
			fireEvent.click(screen.getByTestId("btn-dark"));
		});
		expect(document.cookie).toContain("theme=dark");
	});

	test("ignores cookie value not in themes list", () => {
		document.cookie = "theme=purple; path=/";
		wrap(<ThemeConsumer />, { storage: "cookie", defaultTheme: "light", enableSystem: false });
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});

	test("respects custom storageKey for cookie name", () => {
		document.cookie = "app-theme=dark; path=/";
		wrap(<ThemeConsumer />, { storage: "cookie", storageKey: "app-theme" });
		expect(screen.getByTestId("theme").textContent).toBe("dark");
	});

	test("initialTheme writes to cookie", () => {
		wrap(<ThemeConsumer />, { storage: "cookie", initialTheme: "dark" });
		expect(document.cookie).toContain("theme=dark");
	});

	test("does not react to localStorage storage events when storage='cookie'", () => {
		document.cookie = "theme=light; path=/";
		wrap(<ThemeConsumer />, { storage: "cookie" });

		act(() => {
			dispatchStorageEvent("theme", "dark");
		});

		expect(screen.getByTestId("theme").textContent).toBe("light");
	});
});
