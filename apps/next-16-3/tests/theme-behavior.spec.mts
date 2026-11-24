import { randomBytes } from "node:crypto";
import { expect, test, type Page } from "@playwright/test";
import { ThemeScript } from "@wrksz/themes/script";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

async function expectTheme(page: Page, theme: "light" | "dark") {
	await expect(page.getByTestId("theme-value").filter({ visible: true })).toHaveText(theme);
	await expect(page.locator("html")).toContainClass(theme);
}

test("synchronizes hybrid storage between tabs and resets when storage is cleared", async ({
	context,
	page,
}) => {
	const secondTab = await context.newPage();
	await Promise.all([page.goto("/alpha"), secondTab.goto("/alpha")]);
	await expectTheme(page, "light");
	await expectTheme(secondTab, "light");

	await page.getByRole("button", { name: "Use dark" }).click();
	await expectTheme(secondTab, "dark");
	await secondTab.reload();
	await expectTheme(secondTab, "dark");

	await secondTab.getByRole("button", { name: "Use light" }).click();
	await expectTheme(page, "light");
	await page.getByRole("button", { name: "Use dark" }).click();
	await expectTheme(secondTab, "dark");

	// Remove the cookie mirror before triggering the real cross-tab storage event.
	await context.clearCookies({ name: "theme" });
	await page.evaluate(() => localStorage.clear());
	await expectTheme(secondTab, "light");
	await secondTab.reload();
	await expectTheme(secondTab, "light");
});

test("applies the nonced bootstrap under a restrictive CSP before hydration", async ({
	baseURL,
	context,
	page,
}) => {
	const url = new URL("/theme-csp", baseURL).href;
	const nonce = randomBytes(16).toString("base64");
	const bootstrap = renderToStaticMarkup(
		createElement(ThemeScript, { nonce, storage: "cookie", defaultTheme: "light" }),
	);
	await context.addCookies([{ name: "theme", value: "dark", url }]);
	await page.route(url, (route) =>
		route.fulfill({
			contentType: "text/html; charset=utf-8",
			headers: {
				"content-security-policy": `default-src 'none'; script-src 'nonce-${nonce}'`,
			},
			body: `<!doctype html><html lang="en"><head>${bootstrap}
				<script>document.documentElement.dataset.unapproved = "executed"</script>
			</head><body>Theme fixture</body></html>`,
		}),
	);

	await page.goto(url);
	const root = page.locator("html");
	await expect(root).toContainClass("dark");
	await expect(root).not.toHaveAttribute("data-unapproved", "executed");
});
