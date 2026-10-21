"use client";

import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTOCItems } from "fumadocs-ui/components/toc";
import { useTreePath } from "fumadocs-ui/contexts/tree";
import {
	TOCProvider,
	type TOCProps,
	type TOCProviderProps,
} from "fumadocs-ui/layouts/docs/page/slots/toc";
import { m, useMotionValueEvent, useTransform } from "motion/react";
import {
	Children,
	type CSSProperties,
	cloneElement,
	isValidElement,
	type ReactNode,
	use,
	useEffect,
	useId,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { cn } from "@/lib/cn";
import { MotionProvider } from "./motion-provider";
import { OlderReleasesContext } from "./older-releases";
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
			style={{ marginBottom: next > level ? "0.1875rem" : endGap } as CSSProperties}
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

function useHeadings() {
	const items = useTOCItems();
	return useMemo(
		() =>
			items.map((item) => ({
				id: item.url.slice(1),
				level: item.depth,
				text: stripLinks(item.title),
			})),
		[items],
	);
}

const POPOVER_OFFSET = 112;

function TocPopoverPanel({ headings }: { headings: Heading[] }) {
	const active = useActiveIndex(headings, POPOVER_OFFSET);
	const section = useSectionProgress(headings, POPOVER_OFFSET, active);
	const overall = useTransform(section, (value) => (active + value) / headings.length);
	const [started, setStarted] = useState(false);
	const [open, setOpen] = useState(false);
	const root = useRef<HTMLDivElement>(null);
	const id = useId();
	const page = useTreePath().at(-1)?.name;
	const depths = headingTreeDepths(headings).map((d) => Math.min(d, 2));

	useMotionValueEvent(section, "change", (value) => setStarted(active > 0 || value > 0));

	useEffect(() => {
		if (!open) return;
		const close = (event: Event) => {
			if (
				event instanceof KeyboardEvent
					? event.key === "Escape"
					: !root.current?.contains(event.target as Node)
			)
				setOpen(false);
		};
		window.addEventListener("pointerdown", close);
		window.addEventListener("keydown", close);
		return () => {
			window.removeEventListener("pointerdown", close);
			window.removeEventListener("keydown", close);
		};
	}, [open]);

	const label = started || active > 0 ? headings[active]?.text : page;

	return (
		<div
			ref={root}
			className={cn(
				"border-b bg-fd-background/80 backdrop-blur-sm",
				open && "bg-fd-background shadow-[0_10px_24px_rgb(0_0_0/0.08)]",
			)}
		>
			<button
				type="button"
				aria-expanded={open}
				aria-controls={id}
				onClick={() => setOpen(!open)}
				className="flex h-10 w-full items-center gap-3 px-4 text-start text-sm text-fd-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-inset md:px-6"
			>
				<svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0 -rotate-90">
					<circle
						cx="8"
						cy="8"
						r="6.5"
						fill="none"
						strokeWidth="1.5"
						className="stroke-fd-border"
					/>
					<m.circle
						cx="8"
						cy="8"
						r="6.5"
						fill="none"
						strokeWidth="1.5"
						strokeLinecap="round"
						className="stroke-fd-foreground"
						style={{ pathLength: overall }}
					/>
				</svg>
				<span
					className={cn(
						"min-w-0 flex-1 truncate transition-colors duration-150 [&_code]:text-[0.9em]",
						(open || started) && "text-fd-foreground",
					)}
				>
					{label}
				</span>
				<HugeiconsIcon
					icon={ArrowDown01Icon}
					size={14}
					color="currentColor"
					strokeWidth={2}
					className={cn(
						"shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none",
						open && "rotate-180",
					)}
				/>
			</button>
			<div
				id={id}
				inert={!open}
				className={cn(
					"grid transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
					open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className="min-h-0 overflow-hidden">
					<ScrollFade className="max-h-[50vh] overflow-y-auto overscroll-contain px-4 pb-3 scrollbar-none md:px-6">
						<ol className="flex flex-col">
							{headings.map((heading, index) => {
								const current = index === active;
								const depth = depths[index];
								return (
									<li
										key={heading.id}
										className={cn(
											"ms-[7.25px] border-s-[1.5px] transition-colors duration-150",
											current ? "border-fd-foreground" : "border-fd-border",
										)}
									>
										<a
											href={`#${heading.id}`}
											aria-current={current ? "location" : undefined}
											onClick={(event) => {
												event.preventDefault();
												setOpen(false);
												scrollToHeading(heading.id, POPOVER_OFFSET);
											}}
											className={cn(
												"block py-1.5 ps-[19.25px] text-sm outline-none transition-colors duration-150 wrap-anywhere focus-visible:text-fd-foreground [&_code]:text-[0.9em]",
												current
													? "text-fd-foreground"
													: "text-fd-muted-foreground hover:text-fd-foreground",
											)}
										>
											<span
												className={cn(
													"block min-w-0",
													depth === 1 && "ps-3",
													depth === 2 && "ps-6",
												)}
											>
												{heading.text}
											</span>
										</a>
									</li>
								);
							})}
						</ol>
					</ScrollFade>
				</div>
			</div>
		</div>
	);
}

export function TocProvider({ toc, ...props }: TOCProviderProps) {
	const older = use(OlderReleasesContext);
	const items = useMemo(
		() =>
			older?.open
				? toc.flatMap((item) => (item.url === "#older-releases" ? older.toc : [item]))
				: toc,
		[toc, older],
	);

	return <TOCProvider toc={items} {...props} />;
}

export function TocPopover() {
	const headings = useHeadings();
	if (headings.length === 0) return null;

	return (
		<div className="sticky top-(--fd-docs-row-2) z-10 [grid-area:toc-popover] h-(--fd-toc-popover-height) xl:hidden max-xl:layout:[--fd-toc-popover-height:--spacing(10)]">
			<MotionProvider>
				<TocPopoverPanel headings={headings} />
			</MotionProvider>
		</div>
	);
}

export function Toc({ container }: TOCProps) {
	const headings = useHeadings();

	if (headings.length === 0) {
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
