"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

export function scrollFade(el: HTMLElement | null) {
	if (!el) return;
	const update = () => {
		const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = el;
		el.toggleAttribute("data-scroll-top", scrollTop > 0.5);
		el.toggleAttribute(
			"data-scroll-bottom",
			Math.ceil(scrollTop) + clientHeight < scrollHeight - 0.5,
		);
		el.toggleAttribute("data-scroll-left", scrollLeft > 0.5);
		el.toggleAttribute(
			"data-scroll-right",
			Math.ceil(scrollLeft) + clientWidth < scrollWidth - 0.5,
		);
	};
	const resize = new ResizeObserver(update);
	resize.observe(el);
	for (const child of el.children) resize.observe(child);
	const mutation = new MutationObserver(update);
	mutation.observe(el, { childList: true, subtree: true });
	el.addEventListener("scroll", update, { passive: true });
	update();
	return () => {
		resize.disconnect();
		mutation.disconnect();
		el.removeEventListener("scroll", update);
	};
}

export function ScrollFade({ className, ...props }: ComponentPropsWithoutRef<"div">) {
	return <div ref={scrollFade} className={cn("scroll-fade", className)} {...props} />;
}
