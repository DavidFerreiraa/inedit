"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuestionNavigationProps {
	currentIndex: number;
	totalQuestions: number;
	onPrevious: () => void;
	onNext: () => void;
	answeredCount?: number;
}

export function QuestionNavigation({
	currentIndex,
	totalQuestions,
	onPrevious,
	onNext,
	answeredCount = 0,
}: QuestionNavigationProps) {
	const canGoPrevious = currentIndex > 0;
	const canGoNext = currentIndex < totalQuestions - 1;
	const progressPercentage = (answeredCount / totalQuestions) * 100;

	// Keyboard navigation
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft" && canGoPrevious) {
				event.preventDefault();
				onPrevious();
			} else if (event.key === "ArrowRight" && canGoNext) {
				event.preventDefault();
				onNext();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [canGoPrevious, canGoNext, onPrevious, onNext]);

	if (totalQuestions === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			{/* Progress Bar */}
			<div className="space-y-2">
				<div className="flex items-center justify-between text-sm">
					<span className="font-medium text-foreground">Progresso</span>
					<span className="text-muted-foreground">
						{answeredCount} / {totalQuestions} respondidas
					</span>
				</div>
				<Progress className="h-2" value={progressPercentage} />
			</div>

			{/* Navigation Controls */}
			<div className="flex items-center justify-between gap-4">
				{/* Previous Button */}
				<Button
					className={cn(
						"flex items-center gap-2",
						!canGoPrevious && "cursor-not-allowed opacity-50",
					)}
					disabled={!canGoPrevious}
					onClick={onPrevious}
					size="sm"
					variant="outline"
				>
					<ChevronLeft className="h-4 w-4" />
					<span className="hidden sm:inline">Anterior</span>
				</Button>

				{/* Question Counter */}
				<div className="flex items-center gap-2">
					<div className="rounded-lg bg-muted px-4 py-2">
						<span className="font-semibold text-foreground text-sm">
							<span className="text-lg">{currentIndex + 1}</span>
							<span className="text-muted-foreground"> / {totalQuestions}</span>
						</span>
					</div>
				</div>

				{/* Next Button */}
				<Button
					className={cn(
						"flex items-center gap-2",
						!canGoNext && "cursor-not-allowed opacity-50",
					)}
					disabled={!canGoNext}
					onClick={onNext}
					size="sm"
					variant="outline"
				>
					<span className="hidden sm:inline">Próxima</span>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{/* Keyboard Hints */}
			<div className="flex items-center justify-center gap-4 text-muted-foreground text-xs">
				<div className="flex items-center gap-1">
					<kbd className="rounded bg-muted px-2 py-1 font-mono">←</kbd>
					<span>Anterior</span>
				</div>
				<div className="flex items-center gap-1">
					<kbd className="rounded bg-muted px-2 py-1 font-mono">→</kbd>
					<span>Próxima</span>
				</div>
			</div>
		</div>
	);
}
