"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { KeyboardShortcutsDialog } from "@/components/banca/keyboard-shortcuts-dialog";
import { QuestionsPanel } from "@/components/banca/questions-panel";
import { SourcesPanel } from "@/components/banca/sources-panel";
import { useBancaStore } from "@/lib/stores/banca-store";

interface BancaPageClientProps {
	bancaId: string;
	questionId?: number;
	isEmptyAnswer?: boolean;
	limit?: number;
}

export function BancaPageClient({
	bancaId,
	questionId,
	isEmptyAnswer,
	limit,
}: BancaPageClientProps) {
	const queryClient = useQueryClient();
	const [isGenerating, setIsGenerating] = useState(false);
	const {
		previewQuestionIds,
		setPreviewMode,
		setPreviewQuestionIds,
		clearPreview,
	} = useBancaStore();

	// Check for existing drafts on mount
	useEffect(() => {
		async function checkDrafts() {
			const response = await fetch(
				`/api/banca/${bancaId}/questions?status=draft`,
			);
			if (response.ok) {
				const { questions } = await response.json();
				if (questions.length > 0) {
					setPreviewMode(true);
					setPreviewQuestionIds(questions.map((q: { id: number }) => q.id));
				}
			}
		}
		checkDrafts();
	}, [bancaId, setPreviewMode, setPreviewQuestionIds]);

	// Publish drafts mutation
	const publishDraftsMutation = useMutation({
		mutationFn: async ({ questionIds }: { questionIds: number[] }) => {
			const response = await fetch(`/api/banca/${bancaId}/questions/drafts`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionIds }),
			});
			if (!response.ok) throw new Error("Failed to publish drafts");
			return response.json();
		},
		onSuccess: () => {
			clearPreview();
			queryClient.invalidateQueries({ queryKey: ["questions", bancaId] });
		},
	});

	const generateQuestionsMutation = useMutation({
		mutationFn: async ({
			sourceIds,
			count = 5,
			systemPrompt,
		}: {
			sourceIds: number[];
			count?: number;
			systemPrompt?: string;
		}) => {
			const response = await fetch(`/api/banca/${bancaId}/questions`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ sourceIds, count, systemPrompt }),
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
		onSuccess: (data) => {
			// Set preview mode with newly generated question IDs
			const questionIds = data.questions.map((q: { id: number }) => q.id);
			setPreviewMode(true);
			setPreviewQuestionIds(questionIds);
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

	const handleGenerate = async (sourceIds: number[]) => {
		// Auto-save existing previews before generating new ones
		if (previewQuestionIds.length > 0) {
			try {
				await publishDraftsMutation.mutateAsync({
					questionIds: previewQuestionIds,
				});
			} catch (error) {
				console.error("Failed to auto-save previous preview:", error);
				// Continue with generation even if auto-save fails
			}
		}

		// Hardcoded system prompt - edit this value to customize question generation
		const systemPrompt = `You are an expert question generator for the CEBRASPE exam format.
			Focus on creating high-quality questions that test deep understanding of the material.
			Ensure questions are clear, unambiguous, and have definitive correct answers.
			Keep the focus on the way that CEBRASPE formats their questions. Your return should be in brazilian portuguese.`;

		generateQuestionsMutation.mutate({ sourceIds, count: 5, systemPrompt });
	};

	return (
		<div className="flex flex-col lg:flex-row">
			<SourcesPanel
				bancaId={bancaId}
				isGenerating={isGenerating}
				onGenerate={handleGenerate}
			/>
			<QuestionsPanel
				bancaId={bancaId}
				isEmptyAnswer={isEmptyAnswer}
				limit={limit}
				questionId={questionId}
			/>
			<KeyboardShortcutsDialog />
		</div>
	);
}
