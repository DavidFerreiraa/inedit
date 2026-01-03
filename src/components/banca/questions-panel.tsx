"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBancaStore } from "@/lib/stores/banca-store";
import { PreviewActions } from "./preview-actions";
import { PreviewBanner } from "./preview-banner";
import { QuestionCard } from "./question-card";
import { QuestionNavigation } from "./question-navigation";

interface QuestionOption {
	id: number;
	questionId: number;
	label: string;
	isCorrect: boolean;
	displayOrder: number;
	createdAt: Date;
}

interface UserAnswer {
	id: number;
	userId: string;
	questionId: number;
	selectedOptionId: number;
	isCorrect: boolean;
	timeSpentSeconds: number;
	answeredAt: Date;
}

interface AnswerStats {
	totalAttempts: number;
	correctAttempts: number;
	incorrectAttempts: number;
}

interface Question {
	id: number;
	userId: string;
	bancaId: string;
	title: string;
	description: string | null;
	difficulty: "easy" | "medium" | "hard";
	status: "draft" | "published" | "archived";
	tags: string[];
	generatedFromSourceIds: number[] | null;
	aiPrompt: string | null;
	aiModel: string | null;
	aiTokensUsed: number | null;
	explanation: string | null;
	timesAnswered: number;
	correctAnswerRate: number;
	createdAt: Date;
	updatedAt: Date | null;
	options: QuestionOption[];
	userAnswer: UserAnswer | null;
	answerStats: AnswerStats;
}

interface QuestionsResponse {
	questions: Question[];
}

interface QuestionsPanelProps {
	bancaId: string;
	questionId?: number;
	isEmptyAnswer?: boolean;
	limit?: number;
}

export function QuestionsPanel({
	bancaId,
	questionId,
	isEmptyAnswer,
	limit,
}: QuestionsPanelProps) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const {
		currentQuestionIndex,
		setCurrentQuestionIndex,
		selectedAnswerOptionId,
		setSelectedAnswerOptionId,
		showExplanation,
		toggleExplanation,
		previewMode,
		previewQuestionIds,
		clearPreview,
	} = useBancaStore();

	// Difficulty badge colors
	const difficultyColors = {
		easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
		medium:
			"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
		hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
	};

	// Query for published questions (normal mode)
	const {
		data: publishedData,
		isLoading: publishedLoading,
		error: publishedError,
	} = useQuery<QuestionsResponse>({
		queryKey: ["questions", bancaId, "published", limit],
		queryFn: async () => {
			const response = await fetch(
				`/api/banca/${bancaId}/questions?status=published&limit=${limit}`,
			);
			if (!response.ok) throw new Error("Failed to fetch questions");
			return response.json();
		},
		enabled: !previewMode,
	});

	// Query for draft questions (preview mode)
	const {
		data: draftData,
		isLoading: draftLoading,
		error: draftError,
	} = useQuery<QuestionsResponse>({
		queryKey: ["questions", bancaId, "draft"],
		queryFn: async () => {
			const response = await fetch(
				`/api/banca/${bancaId}/questions?status=draft`,
			);
			if (!response.ok) throw new Error("Failed to fetch questions");
			return response.json();
		},
		enabled: previewMode,
	});

	// Select active data based on mode
	const questions = previewMode
		? (draftData?.questions ?? [])
		: (publishedData?.questions ?? []);
	const isLoading = previewMode ? draftLoading : publishedLoading;
	const error = previewMode ? draftError : publishedError;

	const currentQuestion = questions[currentQuestionIndex];

	// Track answered questions
	const answeredQuestions = new Set<number>();
	questions.forEach((q) => {
		if (q.userAnswer) {
			answeredQuestions.add(q.id);
		}
	});

	// Submit answer mutation
	const submitAnswerMutation = useMutation({
		mutationFn: async ({
			questionId,
			optionId,
		}: {
			questionId: number;
			optionId: number;
		}) => {
			const response = await fetch(
				`/api/banca/${bancaId}/questions/${questionId}/answer`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ selectedOptionId: optionId }),
				},
			);

			if (!response.ok) {
				throw new Error("Failed to submit answer");
			}

			return response.json();
		},
		onSuccess: () => {
			// Refresh questions to update statistics
			queryClient.invalidateQueries({ queryKey: ["questions", bancaId] });
			// Clear query params from URL after answering
			router.replace(`/banca/${bancaId}`, { scroll: false });
		},
	});

	// Publish mutation
	const publishMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/banca/${bancaId}/questions/drafts`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionIds: previewQuestionIds }),
			});
			if (!response.ok) throw new Error("Failed to publish questions");
			return response.json();
		},
		onSuccess: () => {
			clearPreview();
			queryClient.invalidateQueries({ queryKey: ["questions", bancaId] });
		},
	});

	// Discard mutation
	const discardMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch(`/api/banca/${bancaId}/questions/drafts`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ questionIds: previewQuestionIds }),
			});
			if (!response.ok) throw new Error("Failed to discard questions");
			return response.json();
		},
		onSuccess: () => {
			clearPreview();
			queryClient.invalidateQueries({ queryKey: ["questions", bancaId] });
		},
	});

	const handleSavePreview = () => publishMutation.mutate();
	const handleDiscardPreview = () => discardMutation.mutate();

	// Handle answer submission
	const handleAnswer = (optionId: number) => {
		if (!currentQuestion) return;

		setSelectedAnswerOptionId(optionId);
		submitAnswerMutation.mutate({
			questionId: currentQuestion.id,
			optionId,
		});
	};

	// Navigation handlers
	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const handleNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	// Reset question index if it exceeds available questions
	useEffect(() => {
		if (questions.length > 0 && currentQuestionIndex >= questions.length) {
			setCurrentQuestionIndex(0);
		}
	}, [questions.length, currentQuestionIndex, setCurrentQuestionIndex]);

	// Handle "Answer Again" functionality - reset UI state when isEmptyAnswer is true
	useEffect(() => {
		if (isEmptyAnswer && questionId !== undefined) {
			// Find the index of the question to answer again
			const questionIndex = questions.findIndex((q) => q.id === questionId);
			if (questionIndex !== -1) {
				// Navigate to the question
				setCurrentQuestionIndex(questionIndex);
				// Clear the selected answer to allow re-answering
				setSelectedAnswerOptionId(null);
			}
		}
	}, [
		isEmptyAnswer,
		questionId,
		questions,
		setCurrentQuestionIndex,
		setSelectedAnswerOptionId,
	]);

	// Keyboard shortcut for showing explanation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.code === "Space" && selectedAnswerOptionId !== null) {
				event.preventDefault();
				toggleExplanation();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedAnswerOptionId, toggleExplanation]);

	// Loading state
	if (isLoading) {
		return (
			<div className="flex h-full flex-col gap-6 p-6">
				<Skeleton className="h-8 w-32" />
				<Skeleton className="h-64 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	// Error state
	if (error) {
		return (
			<div className="flex h-full items-center justify-center rounded-lg p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Erro ao carregar questões. Por favor, tente novamente.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	// Empty state
	if (questions.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
				<div className="rounded-full bg-muted p-4">
					<BookOpen className="h-8 w-8 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h3 className="font-semibold text-foreground text-lg">
						Nenhuma questão gerada ainda
					</h3>
					<p className="text-muted-foreground text-sm">
						Adicione fontes e clique em "Gerar Questões" para começar
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col gap-4 overflow-y-auto border-foreground/10 border-l p-4 md:gap-6 md:p-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="font-bold text-foreground text-xl md:text-2xl">
					Questões
				</h2>
				{!previewMode && questions.length > 0 && (
					<Link href={`/banca/${bancaId}/all-questions`}>
						<Button size="sm" variant="ghost">
							Ver todas ({questions.length})
						</Button>
					</Link>
				)}
			</div>

			{previewMode ? (
				// PREVIEW MODE
				<>
					<PreviewBanner />
					<div className="space-y-4">
						{questions.map((q) => (
							<Card className="p-4" key={q.id}>
								<div className="space-y-2">
									<div className="flex gap-2">
										<Badge className={difficultyColors[q.difficulty]}>
											{q.difficulty}
										</Badge>
										{q.tags.map((tag) => (
											<Badge key={tag} variant="outline">
												{tag}
											</Badge>
										))}
									</div>
									<h3 className="font-semibold">{q.title}</h3>
									{q.description && (
										<p className="text-muted-foreground text-sm">
											{q.description}
										</p>
									)}
								</div>
							</Card>
						))}
					</div>
					<PreviewActions
						isLoading={publishMutation.isPending || discardMutation.isPending}
						onDiscard={handleDiscardPreview}
						onSave={handleSavePreview}
					/>
				</>
			) : (
				// NORMAL MODE
				<>
					{currentQuestion && (
						<QuestionCard
							key={currentQuestion.id}
							onAnswer={handleAnswer}
							question={{
								...currentQuestion,
								answerStats: currentQuestion.answerStats,
							}}
							showExplanation={showExplanation}
							userAnswer={selectedAnswerOptionId}
						/>
					)}

					<QuestionNavigation
						answeredCount={answeredQuestions.size}
						currentIndex={currentQuestionIndex}
						onNext={handleNext}
						onPrevious={handlePrevious}
						totalQuestions={questions.length}
					/>

					{selectedAnswerOptionId !== null && currentQuestion?.explanation && (
						<div className="hidden items-center justify-center text-muted-foreground text-xs sm:flex">
							<kbd className="rounded bg-muted px-2 py-1 font-mono">Espaço</kbd>
							<span className="ml-2">para mostrar/ocultar explicação</span>
						</div>
					)}
				</>
			)}
		</div>
	);
}
