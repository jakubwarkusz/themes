export const sidebarBaseClass =
	"flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors duration-100 hover:text-fd-foreground";

export const sidebarMutedClass = "text-fd-muted-foreground";
export const sidebarActiveClass = "text-fd-foreground font-medium";

export function sidebarIndent(depth: number) {
	return depth > 0 ? { paddingInlineStart: `${depth * 12 + 12}px` } : undefined;
}
