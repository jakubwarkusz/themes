import { PageShell } from "../components/page-shell";

export default function HomePage() {
	return <PageShell title="home" />;
}

export const getConfig = async () => {
	return {
		render: "static",
	} as const;
};
