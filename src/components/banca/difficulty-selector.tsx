"use client";

import { Lock } from "lucide-react";
import { ProBadge } from "@/components/ui/pro-badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type Difficulty = "easy" | "medium" | "hard";

interface DifficultySelectorProps {
	value?: Difficulty;
	onChange: (value: Difficulty) => void;
	disabled?: boolean;
	isPro: boolean;
}

const difficultyLabels: Record<Difficulty, { label: string; color: string }> = {
	easy: { label: "Fácil", color: "text-green-600" },
	medium: { label: "Médio", color: "text-yellow-600" },
	hard: { label: "Difícil", color: "text-red-600" },
};

export function DifficultySelector({
	value,
	onChange,
	disabled,
	isPro,
}: DifficultySelectorProps) {
	const isLocked = !isPro;

	return (
		<div className="space-y-2" data-testid="difficulty-selector">
			<div className="flex items-center gap-2">
				<span className="font-medium text-sm">Dificuldade</span>
				{isLocked && <ProBadge />}
			</div>
			<Select
				disabled={disabled || isLocked}
				onValueChange={(v) => onChange(v as Difficulty)}
				value={value}
			>
				<SelectTrigger
					className={cn(isLocked && "cursor-not-allowed opacity-50")}
				>
					{isLocked ? (
						<div className="flex items-center gap-2 text-muted-foreground">
							<Lock className="h-4 w-4" />
							<span>Automática</span>
						</div>
					) : (
						<SelectValue placeholder="Selecione a dificuldade" />
					)}
				</SelectTrigger>
				<SelectContent className="bg-zinc-100 dark:bg-zinc-900">
					{Object.entries(difficultyLabels).map(([key, { label, color }]) => (
						<SelectItem key={key} value={key}>
							<span className={color}>{label}</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{isLocked && (
				<p className="text-muted-foreground text-xs">
					Faça upgrade para PRO para escolher a dificuldade
				</p>
			)}
		</div>
	);
}
