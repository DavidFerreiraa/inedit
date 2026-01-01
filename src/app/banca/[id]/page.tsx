import { redirect } from "next/navigation";
import { AppHeader } from "@/components/header";
import { auth } from "@/server/better-auth/config";
import { BancaPageClient } from "./page-client";

const BANCAS_CONFIG = {
	cebraspe: { name: "CEBRASPE", comingSoon: false },
	fgv: { name: "FGV", comingSoon: true },
} as const;

type BancaId = keyof typeof BANCAS_CONFIG;

export default async function BancaPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const banca = BANCAS_CONFIG[id as BancaId];

	// Redirect to home if banca doesn't exist or is coming soon
	if (!banca || banca.comingSoon) {
		redirect("/");
	}

	// Check authentication
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	});

	if (!session?.user) {
		redirect("/auth/signin");
	}

	return (
		<>
			<AppHeader />
			<main className="min-h-screen bg-zinc-100 pt-14">
				<BancaPageClient bancaId={id} />
			</main>
		</>
	);
}
