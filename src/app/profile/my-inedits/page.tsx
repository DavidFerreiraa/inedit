import { redirect } from "next/navigation";
import { AppHeader } from "@/components/header";
import { getAllUserTags, getMyInedits } from "@/server/actions/my-inedits";
import { auth } from "@/server/better-auth/config";
import { MyIneditsPageClient } from "./page-client";

export default async function MyIneditsPage() {
	// Check authentication
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	});

	if (!session?.user) {
		redirect("/auth/signin");
	}

	// Fetch data
	const groupedInedits = await getMyInedits();
	const allTags = await getAllUserTags();

	return (
		<>
			<AppHeader />
			<main className="min-h-screen bg-background py-14">
				<MyIneditsPageClient allTags={allTags} initialGroups={groupedInedits} />
			</main>
		</>
	);
}
