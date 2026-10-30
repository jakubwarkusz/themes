import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger" | "breaking";

const TONES: Record<string, Tone> = {
	info: "info",
	idea: "info",
	success: "success",
	warn: "warning",
	warning: "warning",
	error: "danger",
	breaking: "breaking",
};

const LABELS: Record<Tone, string> = {
	info: "Note",
	success: "Tip",
	warning: "Warning",
	danger: "Danger",
	breaking: "Breaking",
};

export function Callout({
	type = "info",
	title,
	version = "2.0.0",
	children,
}: {
	type?: string;
	title?: ReactNode;
	version?: string;
	children?: ReactNode;
}) {
	const tone = TONES[type] ?? "info";

	return (
		<div role="note" data-tone={tone} className="callout">
			<span className="callout-label">
				{title ?? LABELS[tone]}
				{tone === "breaking" ? <span className="callout-version">v{version}</span> : null}
			</span>
			{children}
		</div>
	);
}
