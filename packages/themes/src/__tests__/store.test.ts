import { describe, expect, test } from "bun:test";
import { createThemeStore } from "../core/store.js";

describe("createThemeStore", () => {
	test("unseeded snapshots are empty and getServerSnapshot is reference-stable", () => {
		const store = createThemeStore();
		const server = store.getServerSnapshot();
		const client = store.getSnapshot();

		expect(server).toEqual({ theme: undefined, systemTheme: undefined });
		expect(client).toEqual({ theme: undefined, systemTheme: undefined });
		expect(store.getServerSnapshot()).toBe(server);
		expect(store.getSnapshot()).toBe(server);
	});

	test("seeded snapshots share one object until the first setState", () => {
		const store = createThemeStore("dark");
		const server = store.getServerSnapshot();
		const client = store.getSnapshot();

		expect(client).toBe(server);
		expect(server).toEqual({ theme: "dark", systemTheme: undefined });
		expect(store.getServerSnapshot()).toBe(server);
	});

	test("setTheme updates the client snapshot without mutating the server snapshot", () => {
		const store = createThemeStore("dark");
		const server = store.getServerSnapshot();

		store.setTheme("light");

		expect(store.getSnapshot()).toEqual({ theme: "light", systemTheme: undefined });
		expect(store.getServerSnapshot()).toBe(server);
		expect(server).toEqual({ theme: "dark", systemTheme: undefined });
	});
});
