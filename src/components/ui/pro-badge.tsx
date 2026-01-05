import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
	className?: string;
	size?: "sm" | "md";
}

export function ProBadge({ className, size = "sm" }: ProBadgeProps) {
	return (
		<Badge
			className={cn(
				"border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white",
				size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
				className,
			)}
		>
			<Crown
				className={cn(size === "sm" ? "mr-0.5 h-3 w-3" : "mr-1 h-4 w-4")}
			/>
			PRO
		</Badge>
	);
}
