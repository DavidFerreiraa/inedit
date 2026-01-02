"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { IneditWithBanca } from "@/server/actions/my-inedits";
import { IneditActionsMenu } from "./inedit-actions-menu";

interface IneditCardProps {
	question: IneditWithBanca;
}

const difficultyColors = {
	easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	medium:
		"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
	hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const difficultyLabels = {
	easy: "Fácil",
	medium: "Médio",
	hard: "Difícil",
};

export function IneditCard({ question }: IneditCardProps) {
	const timeAgo = formatDistanceToNow(new Date(question.createdAt), {
		addSuffix: true,
		locale: ptBR,
	});

	return (
		<Card className="p-4 transition-shadow hover:shadow-md">
			<div className="flex items-start justify-between gap-4">
				{/* Left: Question info */}
				<div className="flex-1 space-y-2">
					{/* Difficulty + Tags */}
					<div className="flex flex-wrap items-center gap-2">
						<Badge className={difficultyColors[question.difficulty]}>
							{difficultyLabels[question.difficulty]}
						</Badge>
						{question.tags.map((tag) => (
							<Badge className="text-xs" key={tag} variant="outline">
								{tag}
							</Badge>
						))}
					</div>

					{/* Title */}
					<h3 className="font-semibold leading-snug">{question.title}</h3>

					{/* Metadata */}
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
						<span>{timeAgo}</span>
						<span className="hidden sm:inline">•</span>
						<span>
							{question.timesAnswered}{" "}
							{question.timesAnswered === 1 ? "resposta" : "respostas"}
						</span>
						{question.timesAnswered > 0 && (
							<>
								<span className="hidden sm:inline">•</span>
								<span>{question.correctAnswerRate}% de acertos</span>
							</>
						)}
					</div>
				</div>

				{/* Right: Actions menu */}
				<IneditActionsMenu question={question} />
			</div>
		</Card>
	);
}
