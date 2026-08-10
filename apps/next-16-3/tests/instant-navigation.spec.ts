import { expect, test } from "@playwright/test";

test("keeps the current theme across prefetched shells and root params", async ({
	context,
	page,
	request,
}) => {
	const consoleErrors: string[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") consoleErrors.push(message.text());
	});

	await context.addCookies([
		{
			name: "theme",
			value: "dark",
			url: "http://127.0.0.1:3137",
		},
	]);
	const documentResponse = await request.get("/alpha", {
		headers: { cookie: "theme=dark" },
	});
	const documentHtml = await documentResponse.text();
	expect(documentHtml.indexOf("data-theme-bootstrap")).toBeLessThan(
		documentHtml.indexOf("<body"),
	);
	expect(documentHtml.indexOf("scoped-theme-target")).toBeLessThan(
		documentHtml.indexOf("data-scoped-theme-bootstrap"),
	);
	expect(documentHtml).toContain("document.cookie");

	await page.goto("/alpha");
	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.getByTestId("root-param")).toHaveText("alpha");
	await expect(page.getByTestId("theme-value").filter({ visible: true })).toHaveText("dark");
	const bootstrapScripts = page.locator("script[data-theme-bootstrap]");
	const initialScriptCount = await bootstrapScripts.count();
	expect(initialScriptCount).toBeGreaterThan(0);
	const bootstrapSources = await bootstrapScripts.allTextContents();
	expect(new Set(bootstrapSources).size).toBe(1);
	await expect(page.locator("body")).toHaveClass(/dark/);
	await expect(page.getByTestId("scoped-theme-target")).toHaveClass(/dark/);
	const bodyBootstrapScripts = page.locator("script[data-body-theme-bootstrap]");
	const scopedBootstrapScripts = page.locator("script[data-scoped-theme-bootstrap]");
	await expect(bodyBootstrapScripts).toHaveCount(1);
	await expect(scopedBootstrapScripts).toHaveCount(1);

	await page.evaluate(() => {
		Object.defineProperty(window, "__spaMarker", { value: true, writable: true });
	});

	// Give viewport links time to prefetch their reusable route shells before changing theme.
	await expect(page.getByRole("link", { name: "About" })).toBeVisible();
	await page.waitForTimeout(250);
	await page.getByRole("button", { name: "Use light" }).click();
	await expect(page.locator("html")).toHaveClass(/light/);

	await page.getByRole("link", { name: "About" }).click();
	await expect(page).toHaveURL("/alpha/about");
	await expect(page.getByRole("heading", { name: "alpha about" })).toBeVisible();
	await expect(page.locator("html")).toHaveClass(/light/);
	await expect(bootstrapScripts).toHaveCount(initialScriptCount);
	await expect(bodyBootstrapScripts).toHaveCount(1);
	await expect(scopedBootstrapScripts).toHaveCount(1);

	await page.getByRole("link", { name: "Switch tenant" }).click();
	await expect(page).toHaveURL("/beta/about");
	await expect(page.getByRole("heading", { name: "beta about" })).toBeVisible();
	await expect(page.getByTestId("root-param").filter({ visible: true })).toHaveText("beta");
	await expect(page.locator("html")).toHaveClass(/light/);
	await expect(bodyBootstrapScripts).toHaveCount(1);
	await expect(scopedBootstrapScripts).toHaveCount(1);

	await page.goBack();
	await expect(page).toHaveURL("/alpha/about");
	await expect(page.getByRole("heading", { name: "alpha about" })).toBeVisible();
	await expect(page.locator("html")).toHaveClass(/light/);

	expect(await page.evaluate(() => Reflect.get(window, "__spaMarker"))).toBe(true);
	expect(consoleErrors).toEqual([]);

	const cookies = await context.cookies();
	expect(cookies.find((cookie) => cookie.name === "theme")?.value).toBe("light");
});
