export const sidebarBaseClass = "flex items-center py-1 ps-6 pe-2 text-sm leading-5";

export const sidebarMutedClass = "text-fd-muted-foreground hover:text-fd-foreground";
export const sidebarActiveClass = "font-medium text-fd-foreground";

export function sidebarIndent(depth: number) {
	return depth > 0 ? { paddingInlineStart: `${depth * 12 + 12}px` } : undefined;
}
