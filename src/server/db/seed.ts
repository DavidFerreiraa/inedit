import { db } from "@/server/db";
import { bancas } from "@/server/db/schema";

async function seed() {
	console.log("Seeding bancas...");

	await db.insert(bancas).values([
		{
			id: "cebraspe",
			name: "CEBRASPE",
			description:
				"Centro Brasileiro de Pesquisa em Avaliação e Seleção e de Promoção de Eventos",
			logoUrl: "/CEBRASPE_logo.png",
			isActive: true,
		},
		{
			id: "fgv",
			name: "FGV",
			description: "Fundação Getulio Vargas",
			logoUrl: "/FGV_logo.png",
			isActive: false, // Coming soon
		},
	]);

	console.log("✓ Bancas seeded successfully!");
}

seed()
	.catch((error) => {
		console.error("Error seeding database:", error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
