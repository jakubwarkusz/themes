import { ImageResponse } from "@takumi-rs/image-response";
import { notFound } from "next/navigation";
import { getPageImage, source } from "@/lib/source";

export const revalidate = false;

function OGImage({ title, description }: { title: string; description?: string }) {
	return (
		<div
			style={{
				display: "flex",
				width: "100%",
				height: "100%",
				backgroundColor: "#0a0a0a",
				position: "relative",
				overflow: "hidden",
				fontFamily: "Inter, sans-serif",
			}}
		>
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage:
						"radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
					backgroundSize: "28px 28px",
					display: "flex",
					WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
				}}
			/>

			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-end",
					padding: "64px 72px",
					width: "100%",
					height: "100%",
					position: "relative",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						marginBottom: "24px",
					}}
				>
					<div
						style={{
							display: "flex",
							fontSize: "20px",
							fontWeight: 500,
							color: "rgba(255,255,255,0.4)",
							letterSpacing: "-0.01em",
						}}
					>
						@wrksz/themes
					</div>
				</div>

				<div
					style={{
						display: "flex",
						fontSize: title.length > 30 ? "64px" : "76px",
						fontWeight: 700,
						color: "#ffffff",
						lineHeight: 1.1,
						letterSpacing: "-0.03em",
						marginBottom: description ? "20px" : "0",
						maxWidth: "900px",
					}}
				>
					{title}
				</div>

				{description && (
					<div
						style={{
							display: "flex",
							fontSize: "28px",
							color: "rgba(255,255,255,0.5)",
							lineHeight: 1.4,
							maxWidth: "820px",
							fontWeight: 400,
						}}
					>
						{description}
					</div>
				)}
			</div>

			<div
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					height: "2px",
					background:
						"linear-gradient(to right, transparent, rgba(139, 92, 246, 0.6), transparent)",
					display: "flex",
				}}
			/>
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
		},
	);
}

export function generateStaticParams() {
	return source.getPages().map((page) => ({
		lang: page.locale,
		slug: getPageImage(page).segments,
	}));
}
