"use client";

import { type MotionValue, useMotionValue, useSpring } from "motion/react";
import { useEffect } from "react";
import { activationLine, type TocHeading } from "./toc-active-heading";

export function useSectionProgress(
	headings: Pick<TocHeading, "id">[],
	offset: number,
	active: number,
): MotionValue<number> {
	const progress = useMotionValue(0);
	const smooth = useSpring(progress, { stiffness: 500, damping: 50 });

	useEffect(() => {
		const article = document.querySelector("article");
		if (!article || headings.length === 0) return;
		const top = (el: Element | null) =>
			el ? el.getBoundingClientRect().top + window.scrollY : 0;

		let frame: number | null = null;
		const update = () => {
			frame = null;
			const line = window.scrollY + activationLine(offset);
			const start = top(document.getElementById(headings[active].id));
			const next = headings[active + 1];
			const end = next
				? top(document.getElementById(next.id))
				: top(article) + article.offsetHeight;
			progress.set(
				Math.min(1, Math.max(0, end > start ? (line - start) / (end - start) : 1)),
			);
		};
		const schedule = () => {
			frame ??= requestAnimationFrame(update);
		};

		update();
		smooth.jump(progress.get());
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
			if (frame !== null) cancelAnimationFrame(frame);
		};
	}, [headings, offset, active, progress, smooth]);

	return smooth;
}
