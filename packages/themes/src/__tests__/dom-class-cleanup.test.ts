import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { applyThemeToDom } from "../core/client-dom.js";
import { applyExtendedThemeToDom, type AppliedThemeState } from "../core/extended-client-dom.js";

type ApplyOptions = Parameters<typeof applyThemeToDom>[0];

let target: HTMLDivElement;
beforeEach(() => {
	vi.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
	target = document.createElement("div");
	target.id = "class-cleanup";
	target.className = "layout";
	document.body.appendChild(target);
});
afterEach(() => {
	target.remove();
	document.head.querySelectorAll("style").forEach((style) => style.remove());
	document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
	vi.restoreAllMocks();
});

const options: ApplyOptions = {
	resolved: "dark",
	attribute: "class",
	themes: ["light", "dark"],
	valueMap: { dark: "dark palette-dark" },
	target: "#class-cleanup",
	disableTransitionOnChange: false,
	enableColorScheme: false,
	themeColor: undefined,
};

for (const { name, createApply } of [
	{ name: "default", createApply: () => applyThemeToDom },
	{
		name: "extended",
		createApply: () => {
			let previous: AppliedThemeState | undefined;
			return (next: ApplyOptions) => {
				previous = applyExtendedThemeToDom({ ...next, previous });
			};
		},
	},
]) {
	describe(`${name} DOM class cleanup`, () => {
		test("does not scan theme mappings for data-only application or repeated class application", () => {
			const apply = createApply();
			const readLight = vi.fn(() => "light");
			const valueMap = {
				get light() {
					return readLight();
				},
				dark: "dark",
			};
			createApply()({ ...options, attribute: "data-theme", valueMap });
			expect(readLight).not.toHaveBeenCalled();
			target.classList.add("light");
			apply({ ...options, valueMap });
			expect(target.className).toBe("layout dark");
			readLight.mockClear();
			for (let i = 0; i < 100; i++) apply({ ...options, valueMap });
			expect(readLight).not.toHaveBeenCalled();
			expect(target.className).toBe("layout dark");
		});

		test("skips unchanged style and meta writes but repairs externally changed values", () => {
			const apply = createApply();
			const next = { ...options, enableColorScheme: true, themeColor: "#000" };
			apply(next);
			const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')!;
			const observer = new MutationObserver(() => {});
			observer.observe(target, { attributes: true });
			observer.observe(meta, { attributes: true });
			try {
				for (let i = 0; i < 100; i++) apply(next);
				expect(observer.takeRecords()).toHaveLength(0);
				target.style.colorScheme = "light";
				meta.content = "#fff";
				observer.takeRecords();
				apply(next);
				expect(target.style.colorScheme).toBe("dark");
				expect(meta.content).toBe("#000");
				expect(observer.takeRecords().map((record) => record.attributeName)).toEqual([
					"style",
					"content",
				]);
			} finally {
				observer.disconnect();
			}
		});

		test("disables transitions before removing obsolete classes even if the data value is unchanged", () => {
			const apply = createApply();
			apply({ ...options, attribute: ["class", "data-theme"] });
			const remove = target.classList.remove.bind(target.classList);
			let protectedRemoval = false;
			vi.spyOn(target.classList, "remove").mockImplementation((...tokens) => {
				if (tokens.includes("dark"))
					protectedRemoval = Array.from(document.head.querySelectorAll("style")).some(
						(style) => style.textContent?.includes("transition:none"),
					);
				remove(...tokens);
			});
			apply({ ...options, attribute: "data-theme", disableTransitionOnChange: true });
			expect(protectedRemoval).toBe(true);
			expect(target.className).toBe("layout");
			expect(target.getAttribute("data-theme")).toBe("dark palette-dark");
		});

		test("preserves active theme classes when class remains in the attribute list", () => {
			const apply = createApply();
			apply(options);
			apply({ ...options, attribute: ["class", "data-theme"] });
			expect(target.className).toBe("layout dark palette-dark");
		});

		test("does not claim classes when only writing a data attribute", () => {
			const apply = createApply();
			target.classList.add("dark", "palette-dark");
			apply({ ...options, attribute: "data-theme" });
			apply({ ...options, attribute: "data-theme", valueMap: { dark: "other" } });
			expect(target.className).toBe("layout dark palette-dark");
		});
	});
}
