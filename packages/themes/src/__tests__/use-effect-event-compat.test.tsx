import { afterEach, expect, test } from "bun:test";
import { cleanup, renderHook } from "@testing-library/react";
import { useEffect } from "react";
import { useEffectEvent } from "../core/use-effect-event.js";

afterEach(cleanup);

test("effect events keep a stable identity while reading the latest callback", () => {
	const calls: string[] = [];
	const { rerender } = renderHook(
		({ value, prefix }: { value: string; prefix: string }) => {
			const onValue = useEffectEvent((next: string) => {
				calls.push(`${prefix}:${next}`);
			});

			// biome-ignore lint/correctness/useExhaustiveDependencies: effect events are intentionally non-reactive.
			useEffect(() => {
				onValue(value);
			}, [value]);

			return onValue;
		},
		{ initialProps: { value: "light", prefix: "initial" } },
	);
	rerender({ value: "dark", prefix: "latest" });

	expect(calls).toEqual(["initial:light", "latest:dark"]);
});
