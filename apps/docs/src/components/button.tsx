import Link from "next/link";
import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = ComponentProps<typeof Link> & {
	variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
	primary:
		"inline-flex h-8 cursor-default items-center gap-1.5 rounded-md bg-fd-primary px-3 text-sm font-medium text-fd-primary-foreground outline-none transition-[opacity,scale] duration-150 ease-out hover:opacity-90 focus-visible:ring-2 focus-visible:ring-fd-ring focus-visible:ring-offset-2 focus-visible:ring-offset-fd-background active:scale-[0.97]",
	secondary:
		"inline-flex h-8 cursor-default items-center gap-1.5 rounded-md bg-fd-card px-3 text-sm text-fd-foreground outline-none transition-[background-color,scale] duration-150 ease-out hover:bg-fd-secondary focus-visible:ring-2 focus-visible:ring-fd-ring active:scale-[0.97]",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
	return (
		<Link className={`${variants[variant]}${className ? ` ${className}` : ""}`} {...props} />
	);
}
