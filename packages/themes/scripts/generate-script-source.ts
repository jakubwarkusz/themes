import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const rootDir = resolve(import.meta.dir, "..");
const checkOnly = process.argv.includes("--check");
const BOOTSTRAP_PARAM_COUNT = 14;

const targets = [
	{
		bootstrapPath: resolve(rootDir, "src/core/script-bootstrap.ts"),
		outputPath: resolve(rootDir, "src/core/script-source.ts"),
		displayPath: "src/core/script-source.ts",
		readableName: "script-bootstrap.ts",
		exportName: "THEME_SCRIPT_SOURCE",
		label: "theme bootstrap",
	},
	{
		bootstrapPath: resolve(rootDir, "src/core/extended-script-bootstrap.ts"),
		outputPath: resolve(rootDir, "src/core/extended-script-source.ts"),
		displayPath: "src/core/extended-script-source.ts",
		readableName: "extended-script-bootstrap.ts",
		exportName: "EXTENDED_THEME_SCRIPT_SOURCE",
		label: "extended theme bootstrap",
	},
] as const;

type SourceTarget = (typeof targets)[number];
type ScriptRange = readonly [number, number];

type ThemeScriptSpecialization = {
	storageTryBody: ScriptRange;
};

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function indexOfMatchingBrace(source: string, openBraceIndex: number): number {
	if (source[openBraceIndex] !== "{") {
		throw new Error(`Expected \`{\` at index ${openBraceIndex}`);
	}

	let depth = 0;
	let inString: '"' | "'" | "`" | null = null;
	let escaped = false;
	let templateExprDepth = 0;

	for (let index = openBraceIndex; index < source.length; index += 1) {
		const char = source[index];
		const next = source[index + 1];

		if (inString === "`") {
			if (templateExprDepth > 0) {
				if (char === "{") templateExprDepth += 1;
				if (char === "}") templateExprDepth -= 1;
				continue;
			}
			if (escaped) {
				escaped = false;
				continue;
			}
			if (char === "\\") {
				escaped = true;
				continue;
			}
			if (char === "`") {
				inString = null;
				continue;
			}
			if (char === "$" && next === "{") {
				templateExprDepth = 1;
				index += 1;
				continue;
			}
			continue;
		}

		if (inString) {
			if (escaped) {
				escaped = false;
				continue;
			}
			if (char === "\\") {
				escaped = true;
				continue;
			}
			if (char === inString) inString = null;
			continue;
		}

		if (char === '"' || char === "'" || char === "`") {
			inString = char;
			continue;
		}
		if (char === "{") depth += 1;
		if (char === "}") {
			depth -= 1;
			if (depth === 0) return index;
		}
	}

	throw new Error("Failed to find a matching `}` in minified bootstrap");
}

function extractMinifiedFunction(bundle: string): string {
	const start = bundle.search(/function\s+\w+\s*\(/u);
	if (start < 0) {
		throw new Error("Expected Bun minify output to contain a named function declaration");
	}

	const bodyStart = bundle.indexOf("{", start);
	if (bodyStart < 0) {
		throw new Error("Expected minified bootstrap function to have a body");
	}

	const bodyEnd = indexOfMatchingBrace(bundle, bodyStart);
	const declaration = bundle.slice(start, bodyEnd + 1);
	// IIFE-friendly anonymous function expression: (function(...){...})(args)
	return declaration.replace(/^function\s+\w+/u, "function");
}

function parseMinifiedParams(minified: string): string[] {
	if (!minified.startsWith("function(")) {
		throw new Error("Expected minified bootstrap to start with function(");
	}
	const paramsEnd = minified.indexOf("){");
	if (paramsEnd < 0) {
		throw new Error("Expected minified bootstrap to have a parameter list");
	}
	const params = minified.slice("function(".length, paramsEnd).split(",");
	if (params.length !== BOOTSTRAP_PARAM_COUNT) {
		throw new Error(
			`Expected ${BOOTSTRAP_PARAM_COUNT} bootstrap params, found ${params.length}`,
		);
	}
	return params;
}

function requireRangeContent(
	source: string,
	range: ScriptRange,
	needles: readonly string[],
	label: string,
): void {
	const [start, end] = range;
	if (start < 0 || end > source.length || start >= end) {
		throw new Error(`Invalid ${label} range [${start}, ${end}]`);
	}
	const slice = source.slice(start, end);
	for (const needle of needles) {
		if (!slice.includes(needle)) {
			throw new Error(`Expected ${label} range to contain ${JSON.stringify(needle)}`);
		}
	}
}

function findCookieParserRange(
	minified: string,
	followSystemParam: string,
	storageKeyParam: string,
): ScriptRange {
	const storedMatch = new RegExp(
		String.raw`let ([A-Za-z_$][\w$]*)=null;if\(!${escapeRegExp(followSystemParam)}\)try\{`,
	).exec(minified);
	if (!storedMatch || storedMatch.index === undefined || storedMatch[1] === undefined) {
		throw new Error("Expected minified bootstrap to declare a stored-theme temp before try");
	}

	const tryOpen = minified.indexOf("try{", storedMatch.index);
	if (tryOpen < 0) {
		throw new Error("Expected minified bootstrap to wrap storage reads in try");
	}
	const openBrace = tryOpen + "try".length;
	const closeBrace = indexOfMatchingBrace(minified, openBrace);
	const tryBodyStart = openBrace + 1;
	const needle = `=localStorage.getItem(${storageKeyParam})`;
	const localIdx = minified.indexOf(needle, tryBodyStart);
	if (localIdx < 0 || localIdx > closeBrace) {
		throw new Error("Expected minified bootstrap to read localStorage first in the try body");
	}
	const afterLocal = localIdx + needle.length;
	if (minified[afterLocal] !== ";") {
		throw new Error("Expected localStorage read to be followed by `;` before cookie parser");
	}
	const range: ScriptRange = [afterLocal, closeBrace];
	requireRangeContent(
		minified,
		range,
		["document.cookie", "decodeURIComponent", "sessionStorage", storageKeyParam],
		"cookie parser range",
	);
	return range;
}

function analyzeThemeScriptSource(minified: string): ThemeScriptSpecialization {
	const params = parseMinifiedParams(minified);
	const storageKeyParam = params[0];
	const followSystemParam = params[13];
	if (!storageKeyParam || !followSystemParam) {
		throw new Error("Expected storageKey and followSystem params");
	}

	const storage = findCookieParserRange(minified, followSystemParam, storageKeyParam);

	return {
		storageTryBody: storage,
	};
}

const scriptPath = resolve(rootDir, "src/core/script.ts");
const scriptDisplayPath = "src/core/script.ts";
const SCRIPT_SLICE_RE = /S\.slice\(0,\s*\d+\)\s*\+\s*S\.slice\(\d+\)/;

function applyScriptSliceOffsets(source: string, range: ScriptRange): string {
	const next = source.replace(SCRIPT_SLICE_RE, `S.slice(0, ${range[0]}) + S.slice(${range[1]})`);
	if (!SCRIPT_SLICE_RE.test(next)) {
		throw new Error("Expected getScript to contain S.slice(0,N)+S.slice(M)");
	}
	return next;
}

function renderSourceFile(target: SourceTarget, minified: string): string {
	const header = `/** Generated by scripts/generate-script-source.ts — edit ${target.readableName} instead. */\n`;
	return `${header}export const ${target.exportName}: string = ${JSON.stringify(minified)};\n`;
}

async function minifyBootstrap(target: SourceTarget): Promise<string> {
	const result = await Bun.build({
		entrypoints: [target.bootstrapPath],
		minify: true,
		target: "browser",
		write: false,
	});

	if (!result.success) {
		const messages = result.logs.map((log) => log.message ?? String(log)).join("\n");
		throw new Error(`Failed to minify ${target.label}:\n${messages}`);
	}

	const output = result.outputs[0];
	if (!output) {
		throw new Error(`Bun.build produced no minify output for ${target.label}`);
	}

	return extractMinifiedFunction(await output.text());
}

const generated = await Promise.all(
	targets.map(async (target) => {
		const minified = await minifyBootstrap(target);
		return {
			target,
			minified,
			contents: renderSourceFile(target, minified),
		};
	}),
);

const themeSource = generated.find((entry) => entry.target.exportName === "THEME_SCRIPT_SOURCE");
if (!themeSource) {
	throw new Error("Expected to generate THEME_SCRIPT_SOURCE");
}
const sliceRange = analyzeThemeScriptSource(themeSource.minified).storageTryBody;
const currentScript = await readFile(scriptPath, "utf8");
const nextScript = applyScriptSliceOffsets(currentScript, sliceRange);

if (checkOnly) {
	const stalePaths: string[] = [];
	for (const { target, contents } of generated) {
		let current = "";
		try {
			current = await readFile(target.outputPath, "utf8");
		} catch {
			current = "";
		}
		if (current !== contents) stalePaths.push(target.displayPath);
	}
	if (currentScript !== nextScript) stalePaths.push(scriptDisplayPath);

	if (stalePaths.length > 0) {
		console.error(
			`${stalePaths.join(", ")} ${stalePaths.length === 1 ? "is" : "are"} out of date. Run \`bun scripts/generate-script-source.ts\`.`,
		);
		process.exit(1);
	}

	console.log("Generated script sources are up to date.");
	process.exit(0);
}

for (const { target, contents } of generated) {
	await mkdir(dirname(target.outputPath), { recursive: true });
	await writeFile(target.outputPath, contents);
	console.log(`Wrote ${target.outputPath}`);
}
if (currentScript !== nextScript) {
	await writeFile(scriptPath, nextScript);
	console.log(`Wrote ${scriptPath}`);
}
