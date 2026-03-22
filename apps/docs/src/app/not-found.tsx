import { Button } from "@/components/button";

export default function NotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center gap-4 py-32 text-center">
			<p className="text-6xl font-bold text-fd-foreground">404</p>
			<p className="text-fd-muted-foreground">This page could not be found.</p>
			<Button href="/" variant="secondary">
				Back to home
			</Button>
		</div>
	);
}
