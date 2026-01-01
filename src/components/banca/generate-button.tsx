"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	isLoading?: boolean;
}

export const GenerateButton = forwardRef<
	HTMLButtonElement,
	GenerateButtonProps
>(({ className, isLoading = false, children, onClick }, ref) => {
	return (
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
				className,
			)}
			disabled={isLoading}
			onClick={onClick}
			ref={ref}
			type="button"
			whileHover={{ scale: 1.05 }}
			whileTap={{ scale: 0.95 }}
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
	);
});

GenerateButton.displayName = "GenerateButton";
