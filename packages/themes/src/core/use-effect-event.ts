"use client";

import * as React from "react";

type EffectEventHook = <Arguments extends unknown[], Result>(
	callback: (...arguments_: Arguments) => Result,
) => (...arguments_: Arguments) => Result;

function useEffectEventFallback<Arguments extends unknown[], Result>(
	callback: (...arguments_: Arguments) => Result,
): (...arguments_: Arguments) => Result {
	const callbackRef = React.useRef(callback);

	React.useInsertionEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	return React.useCallback((...arguments_: Arguments) => callbackRef.current(...arguments_), []);
}

const nativeUseEffectEvent = (
	React as typeof React & {
		useEffectEvent?: EffectEventHook;
	}
).useEffectEvent;

export const useEffectEvent: EffectEventHook = nativeUseEffectEvent ?? useEffectEventFallback;
