"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BancaFromDB = {
	id: string;
	name: string;
	description: string | null;
	logoUrl: string | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date | null;
};

type BancaSelectorProps = {
	bancas: BancaFromDB[];
};

export function BancaSelector({ bancas: bancasFromDB }: BancaSelectorProps) {
	const [currentPage, setCurrentPage] = useState(0);

	// Transform database bancas to display format
	const BANCAS = bancasFromDB.map((banca) => ({
		id: banca.id,
		name: banca.name,
		logoPath: banca.logoUrl ?? "",
		route: `/banca/${banca.id}`,
		comingSoon: !banca.isActive,
	}));

	// Calculate items per page based on screen size (simplified for SSR)
	// With only 2 items, pagination will be hidden on tablet+ (2 cols or more)
	const itemsPerPage = 2; // Shows all items on tablet/desktop
	const totalPages = Math.ceil(BANCAS.length / itemsPerPage);
	const startIndex = currentPage * itemsPerPage;
	const visibleBancas = BANCAS.slice(startIndex, startIndex + itemsPerPage);

	// Don't show pagination if all items fit in one view
	const showPagination = totalPages > 1;

	return (
		<div>
			{/* Grid of banca cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{visibleBancas.map((banca) => {
					if (banca.comingSoon) {
						return (
							<div
								className={cn(
									"group relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 transition-all duration-200 md:p-12",
									"cursor-not-allowed opacity-60",
								)}
								key={banca.id}
							>
								<div className="absolute top-4 right-4">
									<span className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs">
										Coming soon
									</span>
								</div>
								<div className="relative h-24 w-full md:h-32">
									<Image
										alt={`Logo ${banca.name}`}
										className="object-contain"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										src={banca.logoPath}
									/>
								</div>
								<p className="mt-6 font-medium text-base text-foreground md:text-lg">
									{banca.name}
								</p>
							</div>
						);
					}

					return (
						<Link href={`${banca.route}?limit=5`} key={banca.id}>
							<div className="group relative flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 transition-all duration-200 hover:shadow-border/20 hover:shadow-lg md:p-12">
								<div className="relative h-24 w-full md:h-32">
									<Image
										alt={`Logo ${banca.name}`}
										className="object-contain"
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										src={banca.logoPath}
									/>
								</div>
								<p className="mt-6 font-medium text-base text-foreground md:text-lg">
									{banca.name}
								</p>
							</div>
						</Link>
					);
				})}
			</div>

			{/* Pagination controls */}
			{showPagination && (
				<div className="mt-8 flex items-center justify-center gap-4">
					<Button
						aria-label="Previous page"
						disabled={currentPage === 0}
						onClick={() => setCurrentPage((p) => p - 1)}
						size="icon"
						variant="outline"
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					{/* Page dots (Apple-style) */}
					<div className="flex gap-2">
						{Array.from({ length: totalPages }, (_, idx) => idx).map(
							(pageIdx) => (
								<button
									aria-current={pageIdx === currentPage ? "page" : undefined}
									aria-label={`Go to page ${pageIdx + 1}`}
									className={cn(
										"h-2 w-2 rounded-full transition-all",
										pageIdx === currentPage ? "w-6 bg-primary" : "bg-muted",
									)}
									key={pageIdx}
									onClick={() => setCurrentPage(pageIdx)}
									type="button"
								/>
							),
						)}
					</div>

					<Button
						aria-label="Next page"
						disabled={currentPage === totalPages - 1}
						onClick={() => setCurrentPage((p) => p + 1)}
						size="icon"
						variant="outline"
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
