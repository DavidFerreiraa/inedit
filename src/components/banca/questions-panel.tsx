"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useBancaStore } from "@/lib/stores/banca-store";
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
}

interface QuestionsResponse {
	questions: Question[];
}

interface QuestionsPanelProps {
	bancaId: string;
}

export function QuestionsPanel({ bancaId }: QuestionsPanelProps) {
	const queryClient = useQueryClient();
	const {
		currentQuestionIndex,
		setCurrentQuestionIndex,
		selectedAnswerOptionId,
		setSelectedAnswerOptionId,
		showExplanation,
		toggleExplanation,
	} = useBancaStore();

	// Fetch questions
	const {
		data: questionsData,
		isLoading,
		error,
	} = useQuery<QuestionsResponse>({
		queryKey: ["questions", bancaId],
		queryFn: async () => {
			const response = await fetch(`/api/banca/${bancaId}/questions`);
			if (!response.ok) {
				throw new Error("Failed to fetch questions");
			}
			return response.json();
		},
	});

	const questions = questionsData?.questions ?? [];
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
		},
	});

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
			</div>

			{/* Question Card */}
			{currentQuestion && (
				<QuestionCard
					key={currentQuestion.id}
					onAnswer={handleAnswer}
					question={currentQuestion}
					showExplanation={showExplanation}
					userAnswer={
						selectedAnswerOptionId ??
						currentQuestion.userAnswer?.selectedOptionId
					}
				/>
			)}

			{/* Navigation */}
			<QuestionNavigation
				answeredCount={answeredQuestions.size}
				currentIndex={currentQuestionIndex}
				onNext={handleNext}
				onPrevious={handlePrevious}
				totalQuestions={questions.length}
			/>

			{/* Keyboard Hint for Explanation - Hide on mobile (touch users don't need it) */}
			{selectedAnswerOptionId !== null && currentQuestion?.explanation && (
				<div className="hidden items-center justify-center text-muted-foreground text-xs sm:flex">
					<kbd className="rounded bg-muted px-2 py-1 font-mono">Espaço</kbd>
					<span className="ml-2">para mostrar/ocultar explicação</span>
				</div>
			)}
		</div>
	);
}
