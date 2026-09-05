"use client";

import dynamic from "next/dynamic";

export const Analytics = dynamic(
	() => import("@vercel/analytics/next").then((mod) => mod.Analytics),
	{ ssr: false },
);
