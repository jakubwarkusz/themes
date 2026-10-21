export function sameStringList(left: readonly string[], right: readonly string[]): boolean {
	if (left === right) return true;
	if (left.length !== right.length) return false;
	for (let index = 0; index < left.length; index += 1) {
		if (left[index] !== right[index]) return false;
	}
	return true;
}

export function sameStringRecord(
	left: Partial<Record<string, string>> | undefined,
	right: Partial<Record<string, string>> | undefined,
): boolean {
	if (left === right) return true;
	if (!left || !right) return false;
	const leftKeys = Object.keys(left);
	const rightKeys = Object.keys(right);
	if (leftKeys.length !== rightKeys.length) return false;
	for (const key of leftKeys) {
		if (left[key] !== right[key]) return false;
	}
	return true;
}

export function sameThemeColor(
	left: string | Partial<Record<string, string>> | undefined,
	right: string | Partial<Record<string, string>> | undefined,
): boolean {
	if (left === right) return true;
	if (typeof left === "string" || typeof right === "string") return false;
	return sameStringRecord(left, right);
}

export function holdIfEqual<T>(previous: T, next: T, equal: (left: T, right: T) => boolean): T {
	return equal(previous, next) ? previous : next;
}
