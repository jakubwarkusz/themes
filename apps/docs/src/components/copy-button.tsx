"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

const SWAP =
	"absolute inset-0 flex items-center justify-center transition-[opacity,scale,filter] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity";
const SHOWN = "scale-100 opacity-100 blur-0 duration-200";
const HIDDEN =
	"scale-50 opacity-0 blur-[4px] duration-[120ms] motion-reduce:scale-100 motion-reduce:blur-0";

export function CopyButton({
	getValue,
	label = "Copy",
	className,
}: {
	getValue: () => string;
	label?: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	async function copy() {
		try {
			await navigator.clipboard.writeText(getValue());
			setCopied(true);
			clearTimeout(timer.current);
			timer.current = setTimeout(() => setCopied(false), 2000);
		} catch {}
	}

	return (
		<button
			type="button"
			onClick={copy}
			aria-label={copied ? "Copied" : label}
			className={cn(
				"relative flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-fd-muted-foreground outline-none transition-[color,background-color,scale] duration-150 ease-out hover:bg-fd-accent hover:text-fd-foreground focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.96]",
				className,
			)}
		>
			<span aria-hidden className={cn(SWAP, copied ? HIDDEN : SHOWN)}>
				<HugeiconsIcon icon={Copy01Icon} size={14} color="currentColor" strokeWidth={1.5} />
			</span>
			<span aria-hidden className={cn(SWAP, "text-emerald-500", copied ? SHOWN : HIDDEN)}>
				<HugeiconsIcon icon={Tick02Icon} size={14} color="currentColor" strokeWidth={2} />
			</span>
		</button>
	);
}
