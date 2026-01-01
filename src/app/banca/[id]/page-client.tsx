"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { KeyboardShortcutsDialog } from "@/components/banca/keyboard-shortcuts-dialog";
import { QuestionsPanel } from "@/components/banca/questions-panel";
import { ResizableLayout } from "@/components/banca/resizable-layout";
import { SourcesPanel } from "@/components/banca/sources-panel";

interface BancaPageClientProps {
	bancaId: string;
}

export function BancaPageClient({ bancaId }: BancaPageClientProps) {
	const queryClient = useQueryClient();
	const [isGenerating, setIsGenerating] = useState(false);

	const generateQuestionsMutation = useMutation({
		mutationFn: async ({
			sourceIds,
			count = 5,
		}: {
			sourceIds: number[];
			count?: number;
		}) => {
			const response = await fetch(`/api/banca/${bancaId}/questions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sourceIds, count }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to generate questions");
			}

			return response.json();
		},
		onMutate: () => {
			setIsGenerating(true);
		},
		onSuccess: () => {
			// Invalidate questions query to refetch
			queryClient.invalidateQueries({ queryKey: ["questions", bancaId] });
		},
		onError: (error) => {
			console.error("Error generating questions:", error);
			alert(
				error instanceof Error
					? error.message
					: "Failed to generate questions. Please try again.",
			);
		},
		onSettled: () => {
			setIsGenerating(false);
		},
	});

	const handleGenerate = (sourceIds: number[]) => {
		generateQuestionsMutation.mutate({ sourceIds, count: 5 });
	};

	return (
		<>
			<ResizableLayout
				bancaId={bancaId}
				questionsPanel={<QuestionsPanel bancaId={bancaId} />}
				sourcesPanel={
					<SourcesPanel
						bancaId={bancaId}
						isGenerating={isGenerating}
						onGenerate={handleGenerate}
					/>
				}
			/>
			<KeyboardShortcutsDialog />
		</>
	);
}
