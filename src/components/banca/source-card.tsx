"use client";

import {
	File,
	FileText,
	Link as LinkIcon,
	Loader2,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Source {
	id: number;
	type: "file" | "url" | "text";
	title: string;
	content?: string | null;
	url?: string | null;
	fileName?: string | null;
	processingStatus: "pending" | "processing" | "completed" | "failed";
	createdAt: Date;
}

interface SourceCardProps {
	source: Source;
	bancaId: string;
	onDelete?: () => void;
}

const sourceIcons = {
	file: File,
	url: LinkIcon,
	text: FileText,
};

const statusColors = {
	pending: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
	processing: "bg-blue-500/10 text-blue-700 border-blue-500/20",
	completed: "bg-green-500/10 text-green-700 border-green-500/20",
	failed: "bg-red-500/10 text-red-700 border-red-500/20",
};

export function SourceCard({ source, bancaId, onDelete }: SourceCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const Icon = sourceIcons[source.type];

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this source?")) return;

		setIsDeleting(true);
		try {
			const response = await fetch(
				`/api/banca/${bancaId}/sources?sourceId=${source.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete source");
			}

			onDelete?.();
		} catch (error) {
			console.error("Error deleting source:", error);
			alert("Failed to delete source");
		} finally {
			setIsDeleting(false);
		}
	};

	// Format preview text
	const previewText = source.content
		? source.content.slice(0, 100) + (source.content.length > 100 ? "..." : "")
		: source.url || source.fileName || "No preview available";

	const isPending =
		source.processingStatus === "pending" ||
		source.processingStatus === "processing";

	return (
		<div className="relative flex items-start gap-3 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md">
			{/* Icon */}
			<div className="absolute top-5 left-5 rounded-lg bg-primary/10">
				{isPending ? (
					<Loader2 className="size-5 animate-spin text-primary" />
				) : (
					<Icon className="size-5 text-primary" />
				)}
			</div>

			{/* Content */}
			<div className="w-full flex-1 space-y-2 pl-8">
				<div className="flex items-start justify-between gap-2">
					<h3 className="truncate font-medium text-sm">{source.title}</h3>
					<Button
						className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
						disabled={isDeleting}
						onClick={handleDelete}
						size="icon"
						variant="ghost"
					>
						{isDeleting ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Trash2 className="size-4" />
						)}
					</Button>
				</div>

				<p className="line-clamp-2 text-muted-foreground text-xs">
					{previewText}
				</p>

				<div className="flex items-center gap-2">
					<Badge
						className={cn(
							"flex items-center gap-1.5 text-xs capitalize",
							statusColors[source.processingStatus],
						)}
						variant="outline"
					>
						{isPending && <Loader2 className="size-3 animate-spin" />}
						{source.processingStatus}
					</Badge>
					<span className="text-muted-foreground text-xs">
						{new Date(source.createdAt).toLocaleDateString()}
					</span>
				</div>
			</div>
		</div>
	);
}
