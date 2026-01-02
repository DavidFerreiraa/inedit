"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import type { GroupedInedits } from "@/server/actions/my-inedits";
import { BancaGroup } from "./banca-group";
import { EmptyState } from "./empty-state";
import { FiltersBar } from "./filters-bar";

interface IneditsListProps {
	groups: GroupedInedits[];
	allTags: string[];
	searchQuery: string;
	selectedTags: string[];
	onSearchChange: (value: string) => void;
	onTagsChange: (tags: string[]) => void;
	onClearFilters: () => void;
	hasActiveFilters: boolean;
	hasNoResults: boolean;
	totalQuestions: number;
}

export function IneditsList({
	groups,
	allTags,
	searchQuery,
	selectedTags,
	onSearchChange,
	onTagsChange,
	onClearFilters,
	hasActiveFilters,
	hasNoResults,
	totalQuestions,
}: IneditsListProps) {
	return (
		<div className="mx-auto h-full max-w-4xl px-4 py-6 md:px-6 md:py-8">
			{/* Page Header */}
			<div className="mb-6 space-y-2">
				<h1 className="font-bold text-2xl md:text-3xl">Meus Inedits</h1>
				<p className="text-muted-foreground text-sm md:text-base">
					{totalQuestions === 0
						? "Você ainda não criou nenhuma questão"
						: `${totalQuestions} ${totalQuestions === 1 ? "questão criada" : "questões criadas"}`}
				</p>
			</div>

			{/* Filters Bar */}
			{totalQuestions > 0 && (
				<div className="mb-6">
					<FiltersBar
						allTags={allTags}
						hasActiveFilters={hasActiveFilters}
						onClearFilters={onClearFilters}
						onSearchChange={onSearchChange}
						onTagsChange={onTagsChange}
						searchQuery={searchQuery}
						selectedTags={selectedTags}
					/>
				</div>
			)}

			{/* Content Area */}
			{hasNoResults ? (
				<EmptyState
					hasActiveFilters={hasActiveFilters}
					onClearFilters={onClearFilters}
				/>
			) : (
				<>
					{groups.map((group) => (
						<BancaGroup group={group} key={group.bancaId} />
					))}
				</>
			)}
		</div>
	);
}
