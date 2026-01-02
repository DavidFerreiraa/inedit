"use client";

import { useMemo, useState } from "react";
import { IneditsList } from "@/components/profile/my-inedits/inedits-list";
import type { GroupedInedits } from "@/server/actions/my-inedits";

interface MyIneditsPageClientProps {
	initialGroups: GroupedInedits[];
	allTags: string[];
}

export function MyIneditsPageClient({
	initialGroups,
	allTags,
}: MyIneditsPageClientProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);

	// Filter questions based on search and tags
	const filteredGroups = useMemo(() => {
		return initialGroups
			.map((group) => ({
				...group,
				questions: group.questions.filter((question) => {
					// Search: case-insensitive title match
					const matchesSearch =
						searchQuery === "" ||
						question.title.toLowerCase().includes(searchQuery.toLowerCase());

					// Tags: question must have ALL selected tags (AND logic)
					const matchesTags =
						selectedTags.length === 0 ||
						selectedTags.every((tag) => question.tags.includes(tag));

					return matchesSearch && matchesTags;
				}),
			}))
			.map((group) => ({
				...group,
				questionCount: group.questions.length,
			}))
			.filter((group) => group.questionCount > 0);
	}, [initialGroups, searchQuery, selectedTags]);

	const handleClearFilters = () => {
		setSearchQuery("");
		setSelectedTags([]);
	};

	const hasActiveFilters = searchQuery !== "" || selectedTags.length > 0;
	const hasNoResults = filteredGroups.length === 0;

	return (
		<IneditsList
			allTags={allTags}
			groups={filteredGroups}
			hasActiveFilters={hasActiveFilters}
			hasNoResults={hasNoResults}
			onClearFilters={handleClearFilters}
			onSearchChange={setSearchQuery}
			onTagsChange={setSelectedTags}
			searchQuery={searchQuery}
			selectedTags={selectedTags}
			totalQuestions={initialGroups.reduce(
				(sum, group) => sum + group.questionCount,
				0,
			)}
		/>
	);
}
