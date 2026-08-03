"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydrated(): boolean {
	return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
