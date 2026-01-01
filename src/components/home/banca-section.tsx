import { BancaSelector } from "./banca-selector";

export function BancaSection() {
	return (
		<section className="py-12 md:py-16">
			<h2 className="mb-8 font-semibold text-2xl tracking-tight md:text-3xl">
				Selecionar banca
			</h2>
			<BancaSelector />
		</section>
	);
}
