import { expect, test, type Page } from "@playwright/test";

const origin = "http://127.0.0.1:3139";

async function blockApplicationScripts(page: Page) {
	await page.route("**/*", (route) => {
		if (route.request().resourceType() === "script") return route.abort();
		return route.continue();
	});
}

test("applies the stored theme before hydration", async ({ context, page, request }) => {
	await context.addCookies([{ name: "theme", value: "dark", url: origin }]);

	const documentHtml = await (
		await request.get("/", { headers: { cookie: "theme=dark" } })
	).text();
	const bootstrapAt = documentHtml.indexOf("data-theme-bootstrap");
	const bodyAt = documentHtml.indexOf("<body");
	expect(bootstrapAt).toBeGreaterThanOrEqual(0);
	expect(bodyAt).toBeGreaterThan(bootstrapAt);

	await blockApplicationScripts(page);
	await page.goto("/", { waitUntil: "domcontentloaded" });

	const root = page.locator("html");
	await expect(root).toHaveClass(/\bdark\b/);
	await expect(root).toHaveCSS("color-scheme", "dark");
	await expect(page.locator("script[data-theme-bootstrap]")).not.toHaveCount(0);
});

test("keeps the current theme across client navigation", async ({ context, page }) => {
	const consoleErrors: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") consoleErrors.push(message.text());
	});

	await context.addCookies([
		{
			name: "theme",
			value: "dark",
			url: origin,
		},
	]);

	await page.goto("/");
	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.getByTestId("theme-value").filter({ visible: true })).toHaveText("dark");
	const bootstrapScripts = page.locator("script[data-theme-bootstrap]");
	const initialScriptCount = await bootstrapScripts.count();
	expect(initialScriptCount).toBeGreaterThan(0);

	await page.evaluate(() => {
		Object.defineProperty(window, "__spaMarker", { value: true, writable: true });
	});

	await page.getByRole("button", { name: "Use light" }).click();
	await expect(page.locator("html")).toHaveClass(/light/);

	await page.getByRole("link", { name: "About" }).click();
	await expect(page).toHaveURL("/about");
	await expect(page.getByRole("heading", { name: "about" })).toBeVisible();
	await expect(page.locator("html")).toHaveClass(/light/);
	await expect(bootstrapScripts).toHaveCount(initialScriptCount);

	expect(await page.evaluate(() => Reflect.get(window, "__spaMarker"))).toBe(true);
	expect(consoleErrors).toEqual([]);

	const cookies = await context.cookies();
	expect(cookies.find((cookie) => cookie.name === "theme")?.value).toBe("light");
});
