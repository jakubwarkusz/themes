import {
	Alert02Icon,
	AlertCircleIcon,
	CheckmarkCircle02Icon,
	InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger";

const TONES: Record<string, Tone> = {
	info: "info",
	idea: "info",
	success: "success",
	warn: "warning",
	warning: "warning",
	error: "danger",
};

const ICONS = {
	info: InformationCircleIcon,
	success: CheckmarkCircle02Icon,
	warning: Alert02Icon,
	danger: AlertCircleIcon,
} satisfies Record<Tone, unknown>;

export function Callout({
	type = "info",
	title,
	children,
}: {
	type?: string;
	title?: ReactNode;
	children?: ReactNode;
}) {
	const tone = TONES[type] ?? "info";

	return (
		<div role="note" data-tone={tone} className="callout">
			<span className="callout-icon">
				<HugeiconsIcon
					icon={ICONS[tone]}
					size={16}
					color="currentColor"
					strokeWidth={1.8}
				/>
			</span>
			<div className="callout-body">
				{title != null ? <p className="callout-title">{title}</p> : null}
				{children}
			</div>
		</div>
	);
}
