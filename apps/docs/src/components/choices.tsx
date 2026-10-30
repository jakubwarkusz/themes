import { MinusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Children, type CSSProperties, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Choices({ children }: { children: ReactNode }) {
	const first = Children.toArray(children).find(isValidElement) as
		| { props: { children?: ReactNode } }
		| undefined;
	const checks = Children.toArray(first?.props.children).filter(isValidElement).length;

	return (
		<div
			style={{ "--rows": checks + 1 } as CSSProperties}
			className="my-6 grid gap-3 sm:auto-cols-fr sm:grid-flow-col"
		>
			{children}
		</div>
	);
}

export function Choice({
	name,
	from,
	use,
	children,
}: {
	name: string;
	from: string;
	use?: string;
	children: ReactNode;
}) {
	return (
		<div className="grid gap-3 rounded-xl bg-fd-card p-4 text-sm sm:row-span-(--rows) sm:grid-rows-subgrid">
			<div className="not-prose flex min-w-0 flex-col gap-1">
				<span className="font-mono text-[13px] font-medium text-fd-foreground">{name}</span>
				<span className="font-mono text-xs break-all text-fd-muted-foreground">{from}</span>
				{use ? <span className="mt-1 text-xs text-fd-foreground/80">{use}</span> : null}
			</div>
			{children}
		</div>
	);
}

export function Check({ no, children }: { no?: boolean; children: ReactNode }) {
	return (
		<div
			className={cn(
				"flex gap-2 border-t border-fd-border/60 pt-3 leading-relaxed [&_code]:bg-fd-secondary! [&_p]:m-0",
				no ? "text-fd-muted-foreground" : "text-fd-foreground",
			)}
		>
			<span
				className={cn(
					"flex h-lh shrink-0 items-center",
					no ? "text-fd-muted-foreground/60" : "text-emerald-500",
				)}
			>
				<HugeiconsIcon
					icon={no ? MinusSignIcon : Tick02Icon}
					size={14}
					color="currentColor"
					strokeWidth={2}
				/>
				<span className="sr-only">{no ? "No:" : "Yes:"}</span>
			</span>
			<div className="min-w-0">{children}</div>
		</div>
	);
}
