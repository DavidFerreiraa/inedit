import { redirect } from "next/navigation";
import { AppHeader } from "@/components/header";
import { getBancas } from "@/server/actions/bancas";
import { auth } from "@/server/better-auth/config";
import { BancaPageClient } from "./page-client";

export default async function BancaPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// Fetch banca from database
	const allBancas = await getBancas();
	const banca = allBancas.find((b) => b.id === id);

	// Redirect to home if banca doesn't exist or is not active
	if (!banca || !banca.isActive) {
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
