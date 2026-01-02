"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface QuestionOption {
	id: number;
	label: string;
	isCorrect: boolean;
	displayOrder: number;
}

interface Question {
	id: number;
	title: string;
	description: string | null;
	tags: string[];
	explanation: string | null;
	difficulty: "easy" | "medium" | "hard";
	options: QuestionOption[];
}

interface QuestionCardProps {
	question: Question;
	onAnswer: (optionId: number) => void;
	userAnswer?: number | null;
	showExplanation?: boolean;
}

const difficultyColors = {
	easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	medium:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function QuestionCard({
	question,
	onAnswer,
	userAnswer,
	showExplanation = false,
}: QuestionCardProps) {
	const [selectedOption, setSelectedOption] = useState<number | null>(
		userAnswer ?? null,
	);

	// Sync local state with userAnswer prop when it changes
	useEffect(() => {
		setSelectedOption(userAnswer ?? null);
	}, [userAnswer]);

	const correctOption = question.options.find((opt) => opt.isCorrect);
	const isAnswered = selectedOption !== null;
	const isCorrect =
		isAnswered &&
		question.options.find((opt) => opt.id === selectedOption)?.isCorrect;

	const handleOptionSelect = (optionId: number) => {
		if (!isAnswered) {
			setSelectedOption(optionId);
			onAnswer(optionId);
		}
	};

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="flex flex-col gap-6"
			exit={{ opacity: 0, y: -20 }}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.3 }}
		>
			{/* Header */}
			<div className="flex items-start justify-between gap-4">
				<div className="flex flex-wrap gap-2">
					<Badge
						className={cn("text-xs", difficultyColors[question.difficulty])}
						variant="secondary"
					>
						{question.difficulty}
					</Badge>
					{question.tags.map((tag) => (
						<Badge className="text-xs" key={tag} variant="outline">
							{tag}
						</Badge>
					))}
				</div>
			</div>

			{/* Question Title */}
			<div className="space-y-2">
				<h2 className="font-semibold text-foreground text-xl leading-relaxed">
					{question.title}
				</h2>
				{question.description && (
					<p className="text-muted-foreground text-sm">
						{question.description}
					</p>
				)}
			</div>

			{/* Options */}
			<div className="space-y-3">
				{question.options
					.sort((a, b) => a.displayOrder - b.displayOrder)
					.map((option) => {
						const isSelected = selectedOption === option.id;
						const showCorrect = isAnswered && option.isCorrect;
						const showIncorrect = isAnswered && isSelected && !option.isCorrect;

						return (
							<motion.button
								className={cn(
									"w-full rounded-lg border-2 p-4 text-left transition-all duration-200",
									"focus:outline-none focus:ring-2 focus:ring-offset-2",
									!isAnswered && "border-border hover:border-border/80",
									!isAnswered &&
										isSelected &&
										"border-blue-500 bg-blue-50 dark:bg-blue-950/30",
									showCorrect &&
										"border-green-500 bg-green-50 dark:bg-green-950/30",
									showIncorrect &&
										"border-red-500 bg-red-50 dark:bg-red-950/30",
									isAnswered &&
										!isSelected &&
										!option.isCorrect &&
										"opacity-50",
								)}
								disabled={isAnswered}
								key={option.id}
								onClick={() => handleOptionSelect(option.id)}
								type="button"
								whileHover={!isAnswered ? { scale: 1.01 } : {}}
								whileTap={!isAnswered ? { scale: 0.99 } : {}}
							>
								<div className="flex items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										{/* Radio Circle */}
										<div
											className={cn(
												"flex h-5 w-5 items-center justify-center rounded-full border-2",
												!isAnswered && "border-border",
												!isAnswered &&
													isSelected &&
													"border-blue-500 bg-blue-500",
												showCorrect && "border-green-500 bg-green-500",
												showIncorrect && "border-red-500 bg-red-500",
											)}
										>
											{isSelected && !isAnswered && (
												<div className="h-2 w-2 rounded-full bg-white" />
											)}
											{showCorrect && (
												<CheckCircle2 className="h-3 w-3 text-white" />
											)}
											{showIncorrect && (
												<XCircle className="h-3 w-3 text-white" />
											)}
										</div>

										{/* Option Label */}
										<span
											className={cn(
												"font-medium",
												!isAnswered && "text-foreground",
												showCorrect && "text-green-700 dark:text-green-400",
												showIncorrect && "text-red-700 dark:text-red-400",
											)}
										>
											{option.label}
										</span>
									</div>

									{/* Feedback Icons */}
									{showCorrect && (
										<CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
									)}
									{showIncorrect && (
										<XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
									)}
								</div>
							</motion.button>
						);
					})}
			</div>

			{/* Feedback Message */}
			{isAnswered && (
				<motion.div
					animate={{ opacity: 1, y: 0 }}
					className={cn(
						"rounded-lg p-4",
						isCorrect
							? "bg-green-50 dark:bg-green-950/30"
							: "bg-red-50 dark:bg-red-950/30",
					)}
					initial={{ opacity: 0, y: -10 }}
				>
					<div className="flex items-center gap-2">
						{isCorrect ? (
							<CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
						) : (
							<XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
						)}
						<p
							className={cn(
								"font-medium",
								isCorrect
									? "text-green-700 dark:text-green-400"
									: "text-red-700 dark:text-red-400",
							)}
						>
							{isCorrect ? "Correto!" : "Incorreto!"}
						</p>
					</div>
					{!isCorrect && correctOption && (
						<p className="mt-2 text-muted-foreground text-sm">
							A resposta correta é: <strong>{correctOption.label}</strong>
						</p>
					)}
				</motion.div>
			)}

			{/* Explanation Accordion */}
			{question.explanation && (
				<Accordion
					collapsible
					type="single"
					value={showExplanation ? "explanation" : undefined}
				>
					<AccordionItem className="border-none" value="explanation">
						<AccordionTrigger className="rounded-lg bg-muted px-4 py-3 hover:bg-muted/80">
							<span className="font-medium text-foreground text-sm">
								Ver Explicação
							</span>
						</AccordionTrigger>
						<AccordionContent className="px-4 pt-4">
							<p className="text-foreground text-sm leading-relaxed">
								{question.explanation}
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			)}

			{/* Confetti Animation on Correct Answer */}
			{isAnswered && isCorrect && (
				<motion.div
					animate={{ scale: [0, 1.2, 1, 1, 1, 1, 0] }}
					className="pointer-events-none fixed inset-0 flex items-center justify-center"
					initial={{ scale: 0 }}
					transition={{ duration: 1 }}
				>
					<div className="text-6xl">🎉</div>
				</motion.div>
			)}

			{/* Shake Animation on Incorrect Answer */}
			{isAnswered && !isCorrect && (
				<motion.div
					animate={{ x: [-10, 10, -10, 10, 0] }}
					className="pointer-events-none absolute inset-0"
					transition={{ duration: 0.4 }}
				/>
			)}
		</motion.div>
	);
}
