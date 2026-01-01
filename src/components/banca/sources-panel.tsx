"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateButton } from "./generate-button";
import { SourceCard } from "./source-card";
import { SourceTextInput } from "./source-text-input";
import { SourceUploader } from "./source-uploader";
import { SourceUrlInput } from "./source-url-input";

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

interface SourcesPanelProps {
	bancaId: string;
	onGenerate?: (sourceIds: number[]) => void;
	isGenerating?: boolean;
}

export function SourcesPanel({
	bancaId,
	onGenerate,
	isGenerating = false,
}: SourcesPanelProps) {
	const [sources, setSources] = useState<Source[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);

	// Fetch sources
	const fetchSources = async () => {
		try {
			const response = await fetch(`/api/banca/${bancaId}/sources`);
			if (!response.ok) throw new Error("Failed to fetch sources");

			const data = await response.json();
			setSources(data.sources || []);

			// Auto-select all completed sources
			const completedSourceIds = (data.sources || [])
				.filter((s: Source) => s.processingStatus === "completed")
				.map((s: Source) => s.id);
			setSelectedSourceIds(completedSourceIds);
		} catch (error) {
			console.error("Error fetching sources:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: fetchSources is stable
	useEffect(() => {
		fetchSources();
	}, [bancaId]);

	const handleAddSuccess = () => {
		fetchSources();
	};

	const handleDelete = () => {
		fetchSources();
	};

	const handleGenerate = () => {
		if (selectedSourceIds.length === 0) {
			alert("Please select at least one source");
			return;
		}
		onGenerate?.(selectedSourceIds);
	};

	const completedSources = sources.filter(
		(s) => s.processingStatus === "completed",
	);

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Header */}
			<div className="border-b p-4">
				<h2 className="font-semibold text-lg">Sources</h2>
				<p className="text-muted-foreground text-sm">
					Add study materials to generate questions
				</p>
			</div>

			{/* Add Sources Tabs */}
			<div className="border-b p-4">
				<Tabs className="w-full" defaultValue="upload">
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="upload">Upload</TabsTrigger>
						<TabsTrigger value="url">URL</TabsTrigger>
						<TabsTrigger value="text">Text</TabsTrigger>
					</TabsList>

					<TabsContent className="mt-4" value="upload">
						<SourceUploader
							bancaId={bancaId}
							onUploadSuccess={handleAddSuccess}
						/>
					</TabsContent>

					<TabsContent className="mt-4" value="url">
						<SourceUrlInput bancaId={bancaId} onAddSuccess={handleAddSuccess} />
					</TabsContent>

					<TabsContent className="mt-4" value="text">
						<SourceTextInput
							bancaId={bancaId}
							onAddSuccess={handleAddSuccess}
						/>
					</TabsContent>
				</Tabs>
			</div>

			{/* Sources List */}
			<div className="flex-1 overflow-hidden">
				<ScrollArea className="h-full">
					<div className="space-y-4 p-4">
						{isLoading ? (
							<div className="flex items-center justify-center py-8">
								<Loader2 className="size-6 animate-spin text-muted-foreground" />
							</div>
						) : sources.length === 0 ? (
							<div className="rounded-lg border border-dashed p-8 text-center">
								<p className="text-muted-foreground text-sm">
									No sources yet. Add your first source above!
								</p>
							</div>
						) : (
							sources.map((source) => (
								<SourceCard
									bancaId={bancaId}
									key={source.id}
									onDelete={handleDelete}
									source={source}
								/>
							))
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Generate Button */}
			<div className="border-t p-4">
				<GenerateButton
					className="w-full"
					disabled={completedSources.length === 0 || isGenerating}
					isLoading={isGenerating}
					onClick={handleGenerate}
				>
					{isGenerating
						? "Generating..."
						: `Generate Questions (${completedSources.length} sources)`}
				</GenerateButton>
			</div>
		</div>
	);
}
