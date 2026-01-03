"use client";

import { motion } from "framer-motion";
import { AlertCircle, Sparkles } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
	remainingGenerations?: number;
	resetsAt?: string | null;
}

function formatResetTime(resetsAt: string): string {
	const resetDate = new Date(resetsAt);
	return resetDate.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
}

export const GenerateButton = forwardRef<
	HTMLButtonElement,
	GenerateButtonProps
>(
	(
		{
			className,
			isLoading = false,
			remainingGenerations,
			resetsAt,
			children,
			onClick,
			disabled,
		},
		ref,
	) => {
		const isLimitReached =
			remainingGenerations !== undefined && remainingGenerations <= 0;
		const isDisabled = disabled || isLoading || isLimitReached;

		// If limit is reached, show limit notice
		if (isLimitReached && resetsAt) {
			return (
				<div className={cn("flex flex-col gap-2", className)}>
					<motion.div
						animate={{ opacity: 1 }}
						className="flex items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4 text-amber-600 dark:text-amber-400"
						initial={{ opacity: 0 }}
					>
						<AlertCircle className="size-5" />
						<span className="font-medium text-sm">
							Daily limit reached. Resets at {formatResetTime(resetsAt)}
						</span>
					</motion.div>
				</div>
			);
		}

		return (
			<div className={cn("flex flex-col gap-2", className)}>
				<motion.button
					className={cn(
						"group relative overflow-hidden rounded-2xl px-8 py-4 font-semibold text-white transition-all duration-300",
						"bg-gradient-to-br from-indigo-500/80 via-pink-500/80 via-purple-500/80 to-orange-500/80",
						"shadow-[0_8px_32px_rgba(99,102,241,0.35)] backdrop-blur-xl",
						"border border-white/30",
						"hover:shadow-[0_12px_48px_rgba(99,102,241,0.45)]",
						"active:scale-95",
						"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
						"before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100",
					)}
					disabled={isDisabled}
					onClick={onClick}
					ref={ref}
					type="button"
					whileHover={isDisabled ? {} : { scale: 1.05 }}
					whileTap={isDisabled ? {} : { scale: 0.95 }}
				>
					{/* Animated gradient background */}
					<motion.div
						animate={{
							opacity: [0, 1, 0],
							backgroundPosition: ["0% 0%", "100% 100%"],
						}}
						className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-pink-500 via-purple-500 to-orange-500 opacity-0"
						transition={{
							duration: 6,
							repeat: Number.POSITIVE_INFINITY,
							ease: "linear",
						}}
					/>

					{/* Shimmer effect */}
					<div className="absolute inset-0 -z-10 rounded-2xl">
						<motion.div
							animate={{
								x: ["-200%", "200%"],
							}}
							className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
							transition={{
								duration: 3,
								repeat: Number.POSITIVE_INFINITY,
								ease: "linear",
							}}
						/>
					</div>

					{/* Glow effect */}
					<motion.div
						animate={{
							opacity: [0, 0.5, 0],
						}}
						className="absolute -inset-1 -z-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur-xl"
						transition={{
							duration: 2,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					/>

					{/* Button content */}
					<span className="relative z-10 flex items-center gap-2">
						<Sparkles className="size-5" />
						<span>{children ?? "Generate with AI"}</span>
						{isLoading && (
							<motion.div
								animate={{ rotate: 360 }}
								className="ml-2 size-4 rounded-full border-2 border-white/30 border-t-white"
								transition={{
									duration: 1,
									repeat: Number.POSITIVE_INFINITY,
									ease: "linear",
								}}
							/>
						)}
					</span>
				</motion.button>
				{remainingGenerations !== undefined && remainingGenerations > 0 && (
					<p className="text-center text-muted-foreground text-xs">
						{remainingGenerations} generation
						{remainingGenerations !== 1 ? "s" : ""} remaining today
					</p>
				)}
			</div>
		);
	},
);

GenerateButton.displayName = "GenerateButton";
