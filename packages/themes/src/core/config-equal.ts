export function sameStringList(left: readonly string[], right: readonly string[]): boolean {
	if (left === right) return true;
	if (left.length !== right.length) return false;
	for (let index = 0; index < left.length; index += 1) {
		if (left[index] !== right[index]) return false;
	}
	return true;
}

/** Also compares `themeColor`, which may be a plain string instead of a per-theme map. */
export function sameStringRecord(
	left: string | Partial<Record<string, string>> | undefined,
	right: string | Partial<Record<string, string>> | undefined,
): boolean {
	if (left === right) return true;
	if (typeof left !== "object" || typeof right !== "object") return false;
	const leftKeys = Object.keys(left);
	if (leftKeys.length !== Object.keys(right).length) return false;
	for (const key of leftKeys) {
		if (left[key] !== right[key]) return false;
	}
	return true;
}

export function holdIfEqual<T>(previous: T, next: T, equal: (left: T, right: T) => boolean): T {
	return equal(previous, next) ? previous : next;
}
