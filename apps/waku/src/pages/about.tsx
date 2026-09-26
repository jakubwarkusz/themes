import { PageShell } from "../components/page-shell";

export default function AboutPage() {
	return <PageShell title="about" />;
}

export const getConfig = async () => {
	return {
		render: "static",
	} as const;
};
