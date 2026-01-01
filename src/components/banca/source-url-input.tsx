"use client";

import { AlertCircle, Link } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SourceUrlInputProps {
	bancaId: string;
	onAddSuccess?: () => void;
}

export function SourceUrlInput({ bancaId, onAddSuccess }: SourceUrlInputProps) {
	const [url, setUrl] = useState("");
	const [isAdding, setIsAdding] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) return;

		setIsAdding(true);
		setError(null);

		try {
			// Extract title from URL
			const urlObj = new URL(url);
			const title = urlObj.hostname + urlObj.pathname;

			const response = await fetch(`/api/banca/${bancaId}/sources`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					type: "url",
					title,
					url,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to add URL");
			}

			// Success
			setUrl("");
			onAddSuccess?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to add URL");
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div className="space-y-4">
			<form className="flex gap-2" onSubmit={handleSubmit}>
				<div className="relative flex-1">
					<Link className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-9"
						disabled={isAdding}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://example.com/article"
						required
						type="url"
						value={url}
					/>
				</div>
				<Button disabled={isAdding || !url.trim()} type="submit">
					{isAdding ? "Adding..." : "Add URL"}
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
