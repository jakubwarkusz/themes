"use client";

import { ArrowRight01Icon, Link04Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { CopyIcons, useCopied } from "./copy-button";
import { HoverPreview } from "./hover-preview";
import { Beta, Breaking, Since } from "./mdx-badges";

const STACK_AFTER = 32;

type TypePreviewData = {
	title: string;
	description: string;
	fields: { name: string; type: string }[];
};

function readTypePreview(href: string): TypePreviewData | null {
	if (!href.startsWith("#")) return null;
	const heading = document.getElementById(decodeURIComponent(href.slice(1)));
	if (!heading || !/^H[1-6]$/.test(heading.tagName)) return null;

	let description = "";
	let table: Element | null = null;
	for (let node = heading.nextElementSibling; node; node = node.nextElementSibling) {
		if (/^H[1-6]$/.test(node.tagName) && node.tagName <= heading.tagName) break;
		if (!description && node.tagName === "P") description = node.textContent ?? "";
		if (node.hasAttribute("data-props-table")) {
			table = node;
			break;
		}
	}
	if (!table) return null;

	const fields = Array.from(table.querySelectorAll<HTMLElement>("[data-prop-name]"), (row) => ({
		name: row.dataset.propName ?? "",
		type: row.dataset.propType ?? "",
	}));
	return { title: heading.textContent ?? "", description, fields };
}

function TypePreviewCard({ href }: { href: string }) {
	const preview = readTypePreview(href);
	if (!preview) return null;

	return (
		<>
			<div className="flex flex-col gap-1">
				<span className="font-mono text-[13px] font-medium text-fd-foreground">
					{preview.title}
				</span>
				{preview.description ? (
					<p className="line-clamp-2 text-xs leading-relaxed text-fd-muted-foreground">
						{preview.description}
					</p>
				) : null}
			</div>
			<dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-t border-fd-border/60 pt-3 font-mono text-xs">
				{preview.fields.map((field) => (
					<Fragment key={field.name}>
						<dt className="text-fd-foreground">{field.name}</dt>
						<dd className="wrap-break-word text-[#693ACF] dark:text-[#9D6AFB]">
							{field.type}
						</dd>
					</Fragment>
				))}
			</dl>
		</>
	);
}

function TypeLink({ href, type }: { href: string; type: string }) {
	return (
		<HoverPreview
			href={href}
			canOpen={() => readTypePreview(href) !== null}
			content={<TypePreviewCard href={href} />}
			className="min-w-0 wrap-break-word text-[#693ACF] underline decoration-current/30 decoration-dotted underline-offset-4 outline-none transition-[text-decoration-color] duration-150 hover:decoration-current focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-fd-ring dark:text-[#9D6AFB]"
		>
			<code>
				<TypeText type={type} />
			</code>
		</HoverPreview>
	);
}

function splitUnion(type: string) {
	const parts: string[] = [];
	let depth = 0;
	let quote = "";
	let start = 0;
	for (let i = 0; i < type.length; i++) {
		const char = type[i];
		if (quote) {
			if (char === quote) quote = "";
		} else if (char === '"' || char === "'") {
			quote = char;
		} else if ("([{<".includes(char)) {
			depth++;
		} else if (")]}".includes(char) || (char === ">" && type[i - 1] !== "=")) {
			depth--;
		} else if (char === "|" && depth === 0) {
			parts.push(type.slice(start, i).trim());
			start = i + 1;
		}
	}
	parts.push(type.slice(start).trim());
	return parts;
}

function TypeText({ type }: { type: string }) {
	const members = splitUnion(type);

	if (members.length > 1 && type.length > STACK_AFTER) {
		return (
			<span className="flex flex-col">
				{members.map((member, index) => (
					<span key={member}>
						{index > 0 ? <span className="text-fd-muted-foreground">| </span> : null}
						{member}
					</span>
				))}
			</span>
		);
	}

	return type.split(/(?<=\| |, )/).map((chunk, index) => (
		<Fragment key={index}>
			{index > 0 ? <wbr /> : null}
			{chunk}
		</Fragment>
	));
}

export function PropsTable({ children }: { children: ReactNode }) {
	return (
		<div data-props-table className="my-6 border-t border-fd-border/60 text-sm">
			{children}
		</div>
	);
}

export function Prop({
	name,
	type,
	typeHref,
	default: defaultValue,
	required,
	since,
	beta,
	breaking,
	children,
}: {
	name: string;
	type: string;
	typeHref?: string;
	default?: string;
	required?: boolean;
	since?: string;
	beta?: string;
	breaking?: boolean | string;
	children?: ReactNode;
}) {
	const id = `prop-${name.replace(/[^\w-]/g, "")}`;
	const [copied, copy] = useCopied(() => {
		const url = new URL(window.location.href);
		url.hash = id;
		return navigator.clipboard.writeText(url.href);
	});

	return (
		<div
			id={id}
			data-prop-name={name}
			data-prop-type={type}
			className="group/prop relative grid scroll-m-28 gap-x-6 gap-y-2 border-b border-fd-border/60 py-4 leading-5 before:pointer-events-none before:absolute before:-inset-x-3 before:inset-y-1 before:rounded-lg before:bg-fd-accent before:opacity-0 target:before:animate-[prop-target_2s_ease-out] sm:grid-cols-[14rem_minmax(0,1fr)]"
		>
			<div className="not-prose relative flex flex-col items-start gap-1.5 self-start">
				<span className="flex items-center gap-2">
					<span className="flex items-center gap-1">
						<a
							href={`#${id}`}
							className="font-mono text-[13px] font-medium text-fd-foreground outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-fd-ring"
						>
							{name}
						</a>
						<button
							type="button"
							onClick={copy}
							aria-label={copied ? "Link copied" : `Copy link to ${name}`}
							data-copied={copied}
							className="-my-1 flex size-6 shrink-0 items-center justify-center rounded-md text-fd-muted-foreground opacity-0 outline-none transition-[opacity,color,scale] duration-150 ease-out group-hover/prop:opacity-100 hover:text-fd-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96] data-[copied=true]:opacity-100"
						>
							<CopyIcons copied={copied} icon={Link04Icon} />
						</button>
					</span>
					{required ? (
						<span className="text-[11px] font-medium text-fd-muted-foreground">
							required
						</span>
					) : null}
				</span>
				{breaking || beta || since ? (
					<span className="flex flex-wrap gap-1">
						{breaking ? (
							<Breaking
								version={typeof breaking === "string" ? breaking : undefined}
							/>
						) : null}
						{beta ? <Beta version={beta} /> : null}
						{since ? <Since version={since} /> : null}
					</span>
				) : null}
			</div>
			<div className="relative flex min-w-0 flex-col gap-1.5">
				<div className="not-prose flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-[13px]">
					{typeHref ? (
						<TypeLink href={typeHref} type={type} />
					) : (
						<code className="min-w-0 wrap-break-word text-[#693ACF] dark:text-[#9D6AFB]">
							<TypeText type={type} />
						</code>
					)}
					{defaultValue ? (
						<span className="flex items-baseline gap-1.5 text-fd-muted-foreground">
							<span className="font-sans text-xs">Default</span>
							<code className="wrap-break-word text-fd-foreground">
								{defaultValue}
							</code>
						</span>
					) : null}
				</div>
				{children ? (
					<div className="flex flex-col gap-2 leading-relaxed text-fd-muted-foreground [&_p]:m-0">
						{children}
					</div>
				) : null}
			</div>
		</div>
	);
}

export function BreakingNote({ children }: { children: ReactNode }) {
	return (
		<div className="border-l-2 border-(--tone-danger) ps-3 text-fd-foreground/85">
			{children}
		</div>
	);
}

function revealTarget(details: HTMLDetailsElement) {
	const id = decodeURIComponent(window.location.hash.slice(1));
	const target = id ? document.getElementById(id) : null;
	if (!target || !details.contains(target) || details.open) return;
	details.open = true;
	target.scrollIntoView({ block: "start" });
}

export function PropsMore({ children }: { children: ReactNode }) {
	const count = Children.toArray(children).filter(isValidElement).length;

	return (
		<details
			ref={(details) => {
				if (!details) return;
				revealTarget(details);
				const onHashChange = () => revealTarget(details);
				window.addEventListener("hashchange", onHashChange);
				return () => window.removeEventListener("hashchange", onHashChange);
			}}
			className="group/more"
		>
			<summary className="flex cursor-default list-none items-center select-none gap-1.5 border-b border-fd-border/60 py-3 text-sm text-fd-muted-foreground outline-none transition-colors duration-150 hover:text-fd-foreground focus-visible:text-fd-foreground [&::-webkit-details-marker]:hidden">
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					size={14}
					color="currentColor"
					strokeWidth={2}
					className="transition-[rotate] duration-150 ease-out group-open/more:rotate-90"
				/>
				<span className="group-open/more:hidden">Show {count} more props</span>
				<span className="hidden group-open/more:inline">Hide {count} props</span>
			</summary>
			{children}
		</details>
	);
}
