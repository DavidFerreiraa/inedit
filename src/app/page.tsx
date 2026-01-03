import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/header";
import { BancaSection } from "@/components/home";
import { auth } from "@/server/better-auth/config";

export default async function Home() {
	// Check authentication - redirect to signin if not authenticated
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/auth/signin");
	}

	return (
		<>
			<AppHeader />
			<main className="min-h-screen bg-background pt-14">
				<div className="container px-4 py-8 md:px-6">
					<BancaSection />
				</div>
			</main>
		</>
	);
}
