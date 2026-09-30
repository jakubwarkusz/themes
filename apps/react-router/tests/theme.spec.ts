import { expect, test } from "@playwright/test";

test("keeps the current theme across client navigation", async ({ context, page, request }) => {
	const consoleErrors: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") consoleErrors.push(message.text());
	});

	await context.addCookies([
		{
			name: "theme",
			value: "dark",
			url: "http://127.0.0.1:3139",
		},
	]);
	const documentResponse = await request.get("/", {
		headers: { cookie: "theme=dark" },
	});
	const documentHtml = await documentResponse.text();
	expect(documentHtml.indexOf("data-theme-bootstrap")).toBeLessThan(
		documentHtml.indexOf("<body"),
	);

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
