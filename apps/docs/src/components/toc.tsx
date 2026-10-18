"use client";

import { useTOCItems } from "fumadocs-ui/components/toc";
import type { TOCProps } from "fumadocs-ui/layouts/docs/page/slots/toc";
import { m } from "motion/react";
import {
	Children,
	type CSSProperties,
	cloneElement,
	isValidElement,
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/cn";
import { MotionProvider } from "./motion-provider";
import { ScrollFade } from "./scroll-fade";
import {
	headingTreeDepths,
	RAIL_OFFSET,
	scrollToHeading,
	useActiveIndex,
} from "./toc-active-heading";
import { useSectionProgress } from "./toc-section-progress";

const ROW = 12;
const DASH_WIDTH = [16, 11, 7] as const;
const CURRENT_WIDTH = 32;
const WAKE = ["pointermove", "wheel", "touchstart", "keydown"] as const;

const fadeWithList =
	"opacity-0 transition-opacity duration-100 group-hover:opacity-100 group-hover:delay-[60ms] group-hover:duration-200 group-focus-within:opacity-100 group-focus-within:delay-[60ms] group-focus-within:duration-200";

const titleSwap =
	"transition-[opacity,filter,color] duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:[transition-property:opacity,filter] group-focus-within:[transition-property:opacity,filter] motion-reduce:transition-[opacity,color]";

const titleHidden =
	"opacity-0 blur-[4px] group-hover:opacity-100 group-hover:blur-none group-hover:delay-[60ms] group-hover:duration-200 group-focus-within:opacity-100 group-focus-within:blur-none group-focus-within:delay-[60ms] group-focus-within:duration-200";

type Heading = { id: string; level: number; text: ReactNode };

function stripLinks(node: ReactNode): ReactNode {
	return Children.map(node, (child) => {
		if (!isValidElement<{ href?: string; children?: ReactNode }>(child)) return child;
		if (child.type === "a" || child.props.href !== undefined)
			return stripLinks(child.props.children);
		if (child.props.children === undefined) return child;
		return cloneElement(child, undefined, stripLinks(child.props.children));
	});
}

function TocGuides({
	depths,
	index,
	current,
	endGap,
}: {
	depths: number[];
	index: number;
	current: boolean;
	endGap: string;
}) {
	const depth = depths[index];
	const next = depths[index + 1] ?? 0;

	return Array.from({ length: depth }, (_, level) => (
		<span
			// oxlint-disable-next-line react/no-array-index-key
			key={level}
			aria-hidden
			className={cn(
				"w-3 shrink-0 border-l",
				current && level === depth - 1
					? "border-fd-muted-foreground"
					: "border-fd-border/60",
			)}
			style={(next > level ? undefined : { marginBottom: endGap }) as CSSProperties}
		/>
	));
}

function TocRail({ headings }: { headings: Heading[] }) {
	const active = useActiveIndex(headings, RAIL_OFFSET);
	const section = useSectionProgress(headings, RAIL_OFFSET, active);
	const list = useRef<HTMLOListElement>(null);
	const [tops, setTops] = useState<number[] | null>(null);
	const [live, setLive] = useState(false);
	const [settling, setSettling] = useState(true);
	const still = !live || settling;

	useEffect(() => {
		const wake = () => {
			setLive(true);
			for (const type of WAKE) window.removeEventListener(type, wake);
		};
		for (const type of WAKE) window.addEventListener(type, wake, { passive: true });
		return () => {
			for (const type of WAKE) window.removeEventListener(type, wake);
		};
	}, []);

	useLayoutEffect(() => {
		const ol = list.current;
		if (!ol) return;
		let frame = 0;
		const measure = () => {
			setSettling(true);
			setTops(Array.from(ol.children, (li) => (li as HTMLElement).offsetTop));
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				frame = requestAnimationFrame(() => setSettling(false));
			});
		};
		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(ol);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	}, []);

	if (headings.length < 2) return null;
	const depths = headingTreeDepths(headings).map((d) => Math.min(d, 2));

	return (
		<nav
			aria-label="On this page"
			className={cn("group relative w-52", still && "**:transition-none")}
		>
			<ol ref={list} className={cn("pointer-events-none", !tops && "invisible")}>
				{headings.map((heading, index) => {
					const current = index === active;
					const depth = depths[index];
					const restY = tops ? index * ROW - tops[index] : 0;

					return (
						<li
							key={heading.id}
							className="pointer-events-auto grid grid-cols-[2rem_1fr] gap-x-2.5 translate-y-(--rest-y) transition-[translate] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0 group-hover:duration-250 group-focus-within:translate-y-0 group-focus-within:duration-250 motion-reduce:transition-none"
							style={{ "--rest-y": `${restY}px` } as CSSProperties}
						>
							<span aria-hidden className="flex items-center" style={{ height: ROW }}>
								<span
									className={cn(
										"relative h-0.5 overflow-hidden rounded-full transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
										current
											? "bg-fd-ring"
											: index < active
												? "bg-fd-muted-foreground"
												: "bg-fd-border",
									)}
									style={{ width: current ? CURRENT_WIDTH : DASH_WIDTH[depth] }}
								>
									{current && (
										<m.span
											className="absolute inset-0 origin-left bg-fd-foreground"
											style={{ scaleX: section }}
										/>
									)}
								</span>
							</span>

							<div className="-mt-0.75 flex">
								<span aria-hidden className={cn("flex", fadeWithList)}>
									<TocGuides
										depths={depths}
										index={index}
										current={current}
										endGap="0.75rem"
									/>
								</span>
								<a
									href={`#${heading.id}`}
									aria-current={current ? "location" : undefined}
									onClick={(event) => {
										event.preventDefault();
										if (event.detail > 0) event.currentTarget.blur();
										scrollToHeading(heading.id, RAIL_OFFSET);
									}}
									className={cn(
										"block min-w-0 flex-1 pb-3 text-sm leading-4.5 text-pretty wrap-anywhere [&_code]:text-[0.9em]",
										titleSwap,
										depth > 0 && "pl-2",
										current
											? "text-fd-foreground"
											: cn(
													"text-fd-muted-foreground hover:text-fd-foreground/80",
													titleHidden,
												),
									)}
								>
									{heading.text}
								</a>
							</div>
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

function rewind(el: HTMLElement) {
	const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	el.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

export function Toc({ container }: TOCProps) {
	const items = useTOCItems();
	const headings = useMemo(
		() =>
			items.map((item) => ({
				id: item.url.slice(1),
				level: item.depth,
				text: stripLinks(item.title),
			})),
		[items],
	);

	if (items.length === 0) {
		return <div id="nd-toc-placeholder" className="hidden xl:layout:[--fd-toc-width:268px]" />;
	}

	return (
		<div
			id="nd-toc"
			{...container}
			className={cn(
				"sticky top-(--fd-docs-row-1) flex h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] w-(--fd-toc-width) flex-col pt-12 pe-4 pb-2 [grid-area:toc] max-xl:hidden xl:layout:[--fd-toc-width:268px]",
				container?.className,
			)}
		>
			<ScrollFade
				className="-ms-1 min-h-0 flex-1 overflow-y-auto overscroll-contain ps-1 pb-4 scrollbar-none"
				onPointerLeave={(event) => {
					const el = event.currentTarget;
					if (!el.contains(document.activeElement)) rewind(el);
				}}
				onBlur={(event) => {
					const el = event.currentTarget;
					if (!el.contains(event.relatedTarget) && !el.matches(":hover")) rewind(el);
				}}
			>
				<MotionProvider>
					<TocRail headings={headings} />
				</MotionProvider>
			</ScrollFade>
		</div>
	);
}
