"use client";

import { AlertCircle, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SourceTextInputProps {
	bancaId: string;
	onAddSuccess?: () => void;
}

export function SourceTextInput({
	bancaId,
	onAddSuccess,
}: SourceTextInputProps) {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim() || !content.trim()) return;

		setIsAdding(true);
		setError(null);

		try {
			const response = await fetch(`/api/banca/${bancaId}/sources`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "text",
					title,
					content,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add text");
			}

			// Success
			setTitle("");
			setContent("");
			onAddSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add text");
		} finally {
			setIsAdding(false);
		}
	};

	const characterCount = content.length;

	return (
		<div className="space-y-4">
			<form className="space-y-4" onSubmit={handleSubmit}>
				<div className="space-y-2">
					<Label htmlFor="text-title">Title</Label>
					<div className="relative">
						<FileText className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							className="pl-9"
							disabled={isAdding}
							id="text-title"
							maxLength={500}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="e.g., Constitutional Law Notes"
							required
							type="text"
							value={title}
						/>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<Label htmlFor="text-content">Content</Label>
						<span className="text-muted-foreground text-xs">
							{characterCount} characters
						</span>
					</div>
					<Textarea
						className="resize-none font-mono text-sm"
						disabled={isAdding}
						id="text-content"
						onChange={(e) => setContent(e.target.value)}
						placeholder="Paste your study material here..."
						required
						rows={10}
						value={content}
					/>
				</div>

				<Button
					className="w-full"
					disabled={isAdding || !title.trim() || !content.trim()}
					type="submit"
				>
					{isAdding ? "Adding..." : "Add Text"}
				</Button>
			</form>

			{error && (
				<div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
					<AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
					<p className="text-destructive text-sm">{error}</p>
				</div>
			)}
		</div>
	);
}
