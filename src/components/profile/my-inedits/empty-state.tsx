"use client";

import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
	hasActiveFilters: boolean;
	onClearFilters: () => void;
}

export function EmptyState({
	hasActiveFilters,
	onClearFilters,
}: EmptyStateProps) {
	const router = useRouter();

	if (hasActiveFilters) {
		// Filtered to zero results
		return (
			<div className="flex h-[calc(100vh-20rem)] flex-col items-center justify-center gap-4 p-6 text-center">
				<div className="rounded-full bg-muted p-4">
					<BookOpen className="h-12 w-12 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h3 className="font-semibold text-foreground text-lg">
						Nenhuma questão encontrada
					</h3>
					<p className="text-muted-foreground text-sm">
						Tente ajustar os filtros para encontrar o que você procura.
					</p>
				</div>
				<Button onClick={onClearFilters} variant="outline">
					Limpar filtros
				</Button>
			</div>
		);
	}

	// No questions at all
	return (
		<div className="flex h-[calc(100vh-20rem)] flex-col items-center justify-center gap-4 p-6 text-center">
			<div className="rounded-full bg-muted p-4">
				<BookOpen className="h-12 w-12 text-muted-foreground" />
			</div>
			<div className="space-y-2">
				<h3 className="font-semibold text-foreground text-lg">
					Nenhum inedit criado ainda
				</h3>
				<p className="text-muted-foreground text-sm">
					Você ainda não criou nenhuma questão. Comece adicionando fontes e
					gerando suas primeiras questões.
				</p>
			</div>
			<Button onClick={() => router.push("/")}>Criar meus inedits</Button>
		</div>
	);
}
