import { AppHeader } from "@/components/header";

export default async function Home() {
	return (
		<>
			<AppHeader />
			<main className="min-h-screen bg-zinc-100 pt-14">
				<div className="container px-4 py-8 md:px-6">
					{/* Future content */}
				</div>
			</main>
		</>
	);
}
