"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/profile/my-inedits/empty-state";
import { FiltersBar } from "@/components/profile/my-inedits/filters-bar";
import { IneditCard } from "@/components/profile/my-inedits/inedit-card";
import { Button } from "@/components/ui/button";
import type { IneditWithBanca } from "@/server/actions/my-inedits";

interface AllQuestionsPageClientProps {
	banca: {
		id: string;
		name: string;
		description: string | null;
	};
	questions: IneditWithBanca[];
	allTags: string[];
}

export function AllQuestionsPageClient({
	banca,
	questions,
	allTags,
}: AllQuestionsPageClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	const filteredQuestions = useMemo(() => {
		return questions.filter((question) => {
			const matchesSearch =
				searchQuery === "" ||
				question.title.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesTags =
				selectedTags.length === 0 ||
				selectedTags.every((tag) => question.tags.includes(tag));

			return matchesSearch && matchesTags;
		});
	}, [questions, searchQuery, selectedTags]);

	const handleClearFilters = () => {
		setSearchQuery("");
		setSelectedTags([]);
	};

	const hasActiveFilters = searchQuery !== "" || selectedTags.length > 0;
	const hasNoResults = filteredQuestions.length === 0;

	return (
		<div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
			<div className="mb-6 space-y-4">
				<Link href={`/banca/${banca.id}`}>
					<Button className="gap-2" size="sm" variant="ghost">
						<ArrowLeft className="h-4 w-4" />
						Voltar para {banca.name}
					</Button>
				</Link>

				<div className="space-y-2">
					<h1 className="font-bold text-2xl md:text-3xl">
						{banca.name} - Todas as Questões
					</h1>
					<p className="text-muted-foreground text-sm md:text-base">
						{questions.length === 0
							? "Nenhuma questão criada ainda"
							: `${questions.length} ${questions.length === 1 ? "questão" : "questões"}`}
					</p>
				</div>
			</div>

			{questions.length > 0 && (
				<div className="mb-6">
					<FiltersBar
						allTags={allTags}
						hasActiveFilters={hasActiveFilters}
						onClearFilters={handleClearFilters}
						onSearchChange={setSearchQuery}
						onTagsChange={setSelectedTags}
						searchQuery={searchQuery}
						selectedTags={selectedTags}
					/>
				</div>
			)}

			{hasNoResults ? (
				<EmptyState
					hasActiveFilters={hasActiveFilters}
					onClearFilters={handleClearFilters}
				/>
			) : (
				<div className="space-y-3">
					{filteredQuestions.map((question) => (
						<IneditCard key={question.id} question={question} />
					))}
				</div>
			)}
		</div>
	);
}
