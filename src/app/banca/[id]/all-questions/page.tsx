import { redirect } from "next/navigation";
import { AppHeader } from "@/components/header";
import {
	getBancaQuestions,
	getBancaTags,
} from "@/server/actions/banca-questions";
import { getBancas } from "@/server/actions/bancas";
import { auth } from "@/server/better-auth/config";
import { AllQuestionsPageClient } from "./page-client";

export default async function AllQuestionsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	});

	if (!session?.user) {
		redirect("/auth/signin");
	}

	const allBancas = await getBancas();
	const banca = allBancas.find((b) => b.id === id);

	if (!banca || !banca.isActive) {
		redirect("/");
	}

	const questions = await getBancaQuestions(id);
	const tags = await getBancaTags(id);

	return (
		<>
			<AppHeader />
			<main className="min-h-screen bg-background py-14">
				<AllQuestionsPageClient
					allTags={tags}
					banca={banca}
					questions={questions}
				/>
			</main>
		</>
	);
}
