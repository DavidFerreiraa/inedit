import { AppHeader } from "@/components/header";
import { BancaSection } from "@/components/home";

export default async function Home() {
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
