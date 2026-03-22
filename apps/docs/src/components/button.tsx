import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ComponentProps<typeof Link> & {
	variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
	primary:
		"inline-flex items-center justify-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-semibold text-fd-primary-foreground transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.96]",
	secondary:
		"inline-flex items-center justify-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium text-fd-foreground transition-[transform,background-color] duration-150 hover:bg-fd-accent active:scale-[0.96]",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
	return (
		<Link className={`${variants[variant]}${className ? ` ${className}` : ""}`} {...props} />
	);
}
