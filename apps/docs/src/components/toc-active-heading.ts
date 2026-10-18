"use client";

import { useEffect, useRef, useState } from "react";

export type TocHeading = { id: string; level: number };

export const RAIL_OFFSET = 33;
export const READING_LINE = 0.4;

const SELECT_EVENT = "toc:select";
const RELEASE = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

export function activationLine(offset: number): number {
	const viewport = window.innerHeight;
	const scrollable = document.documentElement.scrollHeight - viewport;
	const remaining = scrollable - window.scrollY;
	const span = Math.min(viewport, scrollable);
	const endProgress = span > 0 ? Math.min(1, Math.max(0, 1 - remaining / span)) : 0;
	const base = Math.max(offset, viewport * READING_LINE);
	return base + endProgress * (viewport - base - 1);
}

export function resolveActiveIndex(headings: Pick<TocHeading, "id">[], offset: number): number {
	const line = activationLine(offset);
	let active = 0;
	headings.forEach(({ id }, index) => {
		const el = document.getElementById(id);
		if (el?.getClientRects().length && el.getBoundingClientRect().top <= line) active = index;
	});
	return active;
}

export function useActiveIndex(headings: Pick<TocHeading, "id">[], offset: number) {
	const [active, setActive] = useState(0);
	const locked = useRef(false);

	useEffect(() => {
		if (headings.length === 0) return;
		let frame: number | null = null;
		const update = () => {
			frame = null;
			if (!locked.current) setActive(resolveActiveIndex(headings, offset));
		};
		const schedule = () => {
			frame ??= requestAnimationFrame(update);
		};

		update();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		const observer = new ResizeObserver(schedule);
		observer.observe(document.body);
		return () => {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			observer.disconnect();
			if (frame !== null) cancelAnimationFrame(frame);
		};
	}, [headings, offset]);

	useEffect(() => {
		const release = () => {
			locked.current = false;
			for (const type of RELEASE) window.removeEventListener(type, release);
			setActive(resolveActiveIndex(headings, offset));
		};
		const pin = (event: Event) => {
			const index = headings.findIndex(
				({ id }) => id === (event as CustomEvent<string>).detail,
			);
			if (index < 0) return;
			setActive(index);
			locked.current = true;
			for (const type of RELEASE) window.addEventListener(type, release, { passive: true });
		};
		window.addEventListener(SELECT_EVENT, pin);
		return () => {
			window.removeEventListener(SELECT_EVENT, pin);
			for (const type of RELEASE) window.removeEventListener(type, release);
		};
	}, [headings, offset]);

	return active;
}

export function scrollToHeading(id: string, offset: number) {
	const el = document.getElementById(id);
	if (!el) return;
	window.dispatchEvent(new CustomEvent(SELECT_EVENT, { detail: id }));
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	window.scrollTo({
		top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset + 1),
		behavior: reduced ? "auto" : "smooth",
	});
	window.history.pushState(null, "", `#${id}`);
}

export function headingTreeDepths(headings: Pick<TocHeading, "level">[]): number[] {
	const stack: number[] = [];
	return headings.map((heading) => {
		while (stack.length > 0 && stack[stack.length - 1] >= heading.level) stack.pop();
		const depth = stack.length;
		stack.push(heading.level);
		return depth;
	});
}
