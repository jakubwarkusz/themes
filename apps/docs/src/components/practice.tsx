import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";
import { Badge } from "./mdx-badges";

function Practice({
	good,
	caption,
	children,
}: {
	good: boolean;
	caption?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="my-6 [&_figure]:my-0">
			<div className="not-prose mb-2 flex items-center gap-2 text-sm">
				<Badge tone={good ? "success" : "danger"} icon={good ? Tick02Icon : Cancel01Icon}>
					{good ? "Prefer" : "Avoid"}
				</Badge>
				{caption != null ? (
					<span className="text-fd-muted-foreground">{caption}</span>
				) : null}
			</div>
			{children}
		</div>
	);
}

export function Do({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
	return (
		<Practice good caption={caption}>
			{children}
		</Practice>
	);
}

export function Dont({ caption, children }: { caption?: ReactNode; children: ReactNode }) {
	return (
		<Practice good={false} caption={caption}>
			{children}
		</Practice>
	);
}
