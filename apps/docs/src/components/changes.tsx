import type { ReactNode } from "react";

function inlineCode(text: string) {
	return text
		.split("`")
		.map((part, index) => (index % 2 ? <code key={index}>{part}</code> : part));
}

export function Changes({ children }: { children: ReactNode }) {
	return <div className="my-6 border-t border-fd-border/60 text-sm">{children}</div>;
}

export function Change({ name, children }: { name: string; children: ReactNode }) {
	return (
		<div className="grid gap-x-6 gap-y-2 border-b border-fd-border/60 py-4 leading-relaxed sm:grid-cols-[14rem_minmax(0,1fr)]">
			<div className="font-medium text-fd-foreground">{inlineCode(name)}</div>
			<div className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1.5">
				{children}
			</div>
		</div>
	);
}

export function Before({ children }: { children: ReactNode }) {
	return (
		<>
			<span className="not-prose font-mono text-xs text-fd-muted-foreground">1.x</span>
			<div className="text-fd-muted-foreground [&_p]:m-0">{children}</div>
		</>
	);
}

export function After({ version = "2.0.0", children }: { version?: string; children: ReactNode }) {
	return (
		<>
			<span className="not-prose font-mono text-xs text-(--tone-danger)">{version}</span>
			<div className="text-fd-foreground [&_p]:m-0">{children}</div>
		</>
	);
}

export function Entries({ children }: { children: ReactNode }) {
	return <div className="my-6 border-t border-fd-border/60 text-sm">{children}</div>;
}

export function Entry({
	name,
	use,
	children,
}: {
	name: string;
	use?: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1 border-b border-fd-border/60 py-4 leading-relaxed">
			<code className="not-prose font-mono text-[13px] font-medium break-all text-fd-foreground">
				{name}
			</code>
			{use ? <span className="text-fd-foreground">{inlineCode(use)}</span> : null}
			{children ? <div className="text-fd-muted-foreground [&_p]:m-0">{children}</div> : null}
		</div>
	);
}

export function Pairs({
	left,
	right,
	children,
}: {
	left: string;
	right: string;
	children: ReactNode;
}) {
	return (
		<div className="my-6 text-sm">
			<div className="hidden gap-x-6 border-b border-fd-border/60 pb-2 text-xs font-medium text-fd-muted-foreground sm:grid sm:grid-cols-2">
				<span>{left}</span>
				<span>{right}</span>
			</div>
			<div className="border-t border-fd-border/60 sm:border-t-0">{children}</div>
		</div>
	);
}

export function Pair({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="grid gap-x-6 gap-y-1 border-b border-fd-border/60 py-3 leading-relaxed sm:grid-cols-2">
			<div className="text-fd-foreground">{inlineCode(label)}</div>
			<div className="text-fd-muted-foreground [&_p]:m-0">{children}</div>
		</div>
	);
}
