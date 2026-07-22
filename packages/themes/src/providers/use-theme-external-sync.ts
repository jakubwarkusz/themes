"use client";

import { useEffect, useEffectEvent } from "react";
import { getDomWindow } from "../core/client-dom.js";
import type { ThemeStore } from "../core/store.js";
import { subscribeThemeChannel } from "../core/sync.js";
import type { SystemThemeMap, ThemeProviderProps } from "../core/types.js";

type ResolveSelection = (
	selection: string,
	systemTheme: "light" | "dark" | undefined,
	systemThemeMap: SystemThemeMap<string> | undefined,
) => string | undefined;

type UseThemeExternalSyncOptions<Themes extends string> = {
	storage: ThemeProviderProps["storage"];
	storageKey: string;
	channel: string;
	resolvedDefault: Themes | "system";
	validForcedTheme: Themes | undefined;
	systemThemeMap: SystemThemeMap<string> | undefined;
	isValidTheme: (candidate: string) => candidate is Themes | "system";
	getSnapshot: ThemeStore["getSnapshot"];
	setStoreTheme: ThemeStore["setTheme"];
	applyToDom: (resolved: string) => void;
	resolveSelection: ResolveSelection;
};

/**
 * Subscribes to cross-tab storage, BroadcastChannel, and history/bfcache
 * events so theme stays in sync without rebinding on every render.
 */
export function useThemeExternalSync<Themes extends string>({
	storage,
	storageKey,
	channel,
	resolvedDefault,
	validForcedTheme,
	systemThemeMap,
	isValidTheme,
	getSnapshot,
	setStoreTheme,
	applyToDom,
	resolveSelection,
}: UseThemeExternalSyncOptions<Themes>): void {
	// Keep latest DOM applier for event/subscription handlers without rebinding.
	const applyToDomEvent = useEffectEvent(applyToDom);

	// Re-apply theme on bfcache restore (pageshow) and history navigation (popstate)
	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		const handler = () => {
			const { theme, systemTheme } = getSnapshot();
			const selection = validForcedTheme ?? theme;
			const resolved = selection
				? resolveSelection(selection, systemTheme, systemThemeMap)
				: undefined;
			if (resolved) applyToDomEvent(resolved);
		};
		domWindow.addEventListener("pageshow", handler);
		domWindow.addEventListener("popstate", handler);
		return () => {
			domWindow.removeEventListener("pageshow", handler);
			domWindow.removeEventListener("popstate", handler);
		};
	}, [validForcedTheme, getSnapshot, systemThemeMap, resolveSelection]);

	useEffect(() => {
		const domWindow = getDomWindow();
		if (!domWindow) return;
		if (storage === "none" || storage === "sessionStorage" || storage === "cookie") return;

		const handler = (e: StorageEvent) => {
			if (e.storageArea !== localStorage || e.key !== storageKey) return;
			const newTheme = e.newValue ?? resolvedDefault;
			if (!isValidTheme(newTheme)) return;
			const resolved = resolveSelection(newTheme, getSnapshot().systemTheme, systemThemeMap);
			setStoreTheme(newTheme);
			if (!validForcedTheme && resolved) applyToDomEvent(resolved);
		};
		domWindow.addEventListener("storage", handler);
		return () => domWindow.removeEventListener("storage", handler);
	}, [
		storage,
		storageKey,
		resolvedDefault,
		isValidTheme,
		systemThemeMap,
		validForcedTheme,
		getSnapshot,
		setStoreTheme,
		resolveSelection,
	]);

	useEffect(() => {
		if (storage === "none") return;
		return subscribeThemeChannel(channel, (newTheme) => {
			if (!isValidTheme(newTheme)) return;
			setStoreTheme(newTheme);
			const resolved = resolveSelection(newTheme, getSnapshot().systemTheme, systemThemeMap);
			if (!validForcedTheme && resolved) applyToDomEvent(resolved);
		});
	}, [
		storage,
		channel,
		isValidTheme,
		systemThemeMap,
		validForcedTheme,
		getSnapshot,
		setStoreTheme,
		resolveSelection,
	]);
}
