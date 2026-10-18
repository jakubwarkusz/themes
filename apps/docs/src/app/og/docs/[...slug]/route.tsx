import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "takumi-js/response";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;

const ASSETS = join(process.cwd(), "src/assets/home");
const images = [
	{ src: "sky", data: () => readFile(join(ASSETS, "sky-night.webp")) },
	{ src: "sticker", data: () => readFile(join(ASSETS, "sticker.png")) },
];

const fonts = readFile(join(process.cwd(), "src/app/fonts/Inter.woff2")).then((data) => [
	{ name: "Inter", data },
]);

const CREAM = "#F4F2EC";

const ogRootStyle: CSSProperties = {
	display: "flex",
	width: "100%",
	height: "100%",
	backgroundColor: "#1B1A17",
	position: "relative",
	overflow: "hidden",
	fontFamily: "Inter, sans-serif",
};

const ogSkyStyle: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundImage: "url(sky)",
	backgroundSize: "cover",
	backgroundPosition: "center",
	display: "flex",
};

const ogShadeStyle: CSSProperties = {
	position: "absolute",
	inset: 0,
	backgroundImage: "linear-gradient(180deg, rgba(26,23,16,0.05) 0%, rgba(26,23,16,0.7) 100%)",
	display: "flex",
};

const ogContentStyle: CSSProperties = {
	display: "flex",
	flexDirection: "column",
	justifyContent: "flex-end",
	padding: "64px 72px",
	width: "100%",
	height: "100%",
	position: "relative",
};

const ogBrandStyle: CSSProperties = {
	display: "flex",
	fontSize: "24px",
	fontWeight: 500,
	color: "rgba(244,242,236,0.8)",
	letterSpacing: "-0.01em",
};

const ogBrandRowStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	gap: "14px",
	marginBottom: "28px",
};

const ogDescriptionStyle: CSSProperties = {
	display: "flex",
	fontSize: "28px",
	color: "rgba(244,242,236,0.75)",
	lineHeight: 1.4,
	maxWidth: "820px",
	fontWeight: 400,
};

function ogTitleStyle(title: string, hasDescription: boolean): CSSProperties {
	return {
		display: "flex",
		fontSize: title.length > 30 ? "64px" : "76px",
		fontWeight: 700,
		color: CREAM,
		lineHeight: 1.1,
		letterSpacing: "-0.03em",
		marginBottom: hasDescription ? "20px" : "0",
		maxWidth: "900px",
	};
}

function OGImage({ title, description }: { title: string; description?: string }) {
	return (
		<div style={ogRootStyle}>
			<div style={ogSkyStyle} />
			<div style={ogShadeStyle} />

			<div style={ogContentStyle}>
				<div style={ogBrandRowStyle}>
					<img src="sticker" alt="" width={52} height={52} />
					<div style={ogBrandStyle}>@wrksz/themes</div>
				</div>

				<div style={ogTitleStyle(title, Boolean(description))}>{title}</div>

				{description && <div style={ogDescriptionStyle}>{description}</div>}
			</div>
		</div>
	);
}

export async function GET(_req: Request, { params }: RouteContext<"/og/docs/[...slug]">) {
	const { slug } = await params;
	const page = source.getPage(slug.slice(0, -1));
	if (!page) notFound();

	return new ImageResponse(
		<OGImage title={page.data.title} description={page.data.description} />,
		{
			width: 1200,
			height: 630,
			format: "webp",
			images,
			fonts,
		},
	);
}

export function generateStaticParams() {
	return source.getPages().map((page) => ({
		lang: page.locale,
		slug: getPageImage(page).segments,
	}));
}
