import {
	markdownTable,
	replaceSource,
	type Stringifier,
} from "fumadocs-core/mdx-plugins/stringifier";

type File = Parameters<typeof replaceSource>[0];
type Node = Parameters<typeof replaceSource>[1];

type JsxNode = {
	type: "mdxJsxFlowElement" | "mdxJsxTextElement";
	name: string | null;
	attributes: { type: string; name?: string; value?: unknown }[];
	children: unknown[];
};

const UI_ONLY = new Set(["Changelog", "Configurator", "MigrateWithAI", "SetupWithAI"]);

function isJsx(node: unknown): node is JsxNode {
	const type = (node as { type?: string }).type;
	return type === "mdxJsxFlowElement" || type === "mdxJsxTextElement";
}

function attr(node: JsxNode, name: string): string | true | undefined {
	const found = node.attributes.find(
		(attribute) => attribute.type === "mdxJsxAttribute" && attribute.name === name,
	);
	if (!found) return undefined;
	return typeof found.value === "string" ? found.value : true;
}

function walk(node: unknown, visit: (node: JsxNode) => void) {
	if (isJsx(node)) visit(node);
	for (const child of (node as { children?: unknown[] }).children ?? []) walk(child, visit);
}

function collectProps(node: JsxNode): JsxNode[] {
	const props: JsxNode[] = [];
	walk(node, (child) => {
		if (child.name === "Prop") props.push(child);
	});
	return props;
}

function cell(markdown: string) {
	return markdown
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean)
		.join(" ")
		.replaceAll("|", "\\|");
}

function breakingLabel(node: JsxNode) {
	const version = attr(node, "breaking") ?? attr(node, "version");
	return `**Breaking (v${typeof version === "string" ? version : "2.0.0"})**`;
}

function propsTable(s: Stringifier, node: JsxNode) {
	const props = collectProps(node);
	const hasDefault = props.some((prop) => attr(prop, "default") || attr(prop, "required"));
	const header = hasDefault
		? ["Name", "Type", "Default", "Description"]
		: ["Name", "Type", "Description"];

	const rows = props.map((prop) => {
		const name = `\`${attr(prop, "name")}\``;
		const type = `\`${cell(String(attr(prop, "type")))}\``;
		const defaultValue = attr(prop, "default");
		let description = cell(s.inner(prop as Node));
		if (attr(prop, "breaking") && !description.includes("**Breaking")) {
			description = `${breakingLabel(prop)} ${description}`;
		}
		if (!hasDefault) return [name, type, description];
		const fallback = attr(prop, "required") ? "**required**" : "-";
		return [
			name,
			type,
			typeof defaultValue === "string" ? `\`${cell(defaultValue)}\`` : fallback,
			description,
		];
	});

	return markdownTable([header, ...rows]);
}

function replacement(node: JsxNode): Parameters<typeof replaceSource>[2] | undefined {
	const name = node.name ?? "";
	if (UI_ONLY.has(name) || name.endsWith("Demo")) return "";

	switch (name) {
		case "PropsTable":
			return (s) => propsTable(s, node);
		case "BreakingNote":
			return (s) => `${breakingLabel(node)}: ${cell(s.inner(node as Node))}`;
		case "InstallCommand":
			return "```bash\nnpm install @wrksz/themes\n```";
		case "Callout":
			return (s) => {
				const label = attr(node, "type") === "warn" ? "Warning" : "Note";
				const body = s.inner(node as Node).trim();
				return `> **${label}:** ${body.replaceAll("\n", "\n> ")}`;
			};
		case "Do":
		case "Dont":
			return (s) => {
				const caption = attr(node, "caption");
				const label = name === "Do" ? "Do" : "Don't";
				const heading = typeof caption === "string" ? `${label}: ${caption}` : label;
				return `**${heading}**\n\n${s.inner(node as Node).trim()}`;
			};
		case "Breaking":
			return breakingLabel(node);
		case "Since":
			return `*Since v${attr(node, "version")}*`;
		case "Beta":
			return `*Beta v${attr(node, "version")}*`;
		case "Yes":
			return typeof attr(node, "note") === "string" ? `Yes (${attr(node, "note")})` : "Yes";
		case "No":
			return "No";
		case "Fixed":
			return typeof attr(node, "note") === "string"
				? `Fixed (${attr(node, "note")})`
				: "Fixed";
		case "Bug":
			return "Bug";
		default:
			return undefined;
	}
}

export function remarkLLMsComponents() {
	return (tree: unknown, file: File) => {
		walk(tree, (node) => {
			const text = replacement(node);
			if (text !== undefined) replaceSource(file, node as Node, text);
		});
	};
}
