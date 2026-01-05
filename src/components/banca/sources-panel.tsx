"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Difficulty, DifficultySelector } from "./difficulty-selector";
import { GenerateButton } from "./generate-button";
import { SourceCard } from "./source-card";
import { SourceSelectorDropdown } from "./source-selector-dropdown";
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

interface GenerationStatus {
	remainingGenerations: number;
	dailyLimit: number;
	usedToday: number;
	resetsAt: string;
	isPro: boolean;
	canSelectDifficulty: boolean;
}

interface SourcesPanelProps {
	bancaId: string;
	onGenerate?: (sourceIds: number[], difficulty?: Difficulty) => void;
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
	const [selectedSource, setSelectedSource] = useState<
		"upload" | "url" | "text"
	>("upload");
	const [generationStatus, setGenerationStatus] =
		useState<GenerationStatus | null>(null);
	const [selectedDifficulty, setSelectedDifficulty] = useState<
		Difficulty | undefined
	>(undefined);

	// Fetch generation status
	const fetchGenerationStatus = useCallback(async () => {
		try {
			const response = await fetch("/api/user/generation-status");
			if (response.ok) {
				const data = await response.json();
				setGenerationStatus(data);
			}
		} catch (error) {
			console.error("Error fetching generation status:", error);
		}
	}, []);

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
		fetchGenerationStatus();
	}, [bancaId, fetchGenerationStatus]);

	// Refetch generation status when generation completes
	const [wasGenerating, setWasGenerating] = useState(false);
	useEffect(() => {
		if (wasGenerating && !isGenerating) {
			// Generation just completed, refetch status
			fetchGenerationStatus();
		}
		setWasGenerating(isGenerating);
	}, [isGenerating, wasGenerating, fetchGenerationStatus]);

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
		onGenerate?.(selectedSourceIds, selectedDifficulty);
	};

	const completedSources = sources.filter(
		(s) => s.processingStatus === "completed",
	);

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Header */}
			<div className="border-b p-3 md:p-4">
				<h2 className="font-semibold text-base md:text-lg">Conteúdo</h2>
				<p className="text-muted-foreground text-xs md:text-sm">
					Adicione seu conteúdo de estudo para gerar questões automaticamente
				</p>
			</div>

			{/* Add Sources - Responsive */}
			<div className="border-b p-3 md:p-4">
				{/* Mobile: Dropdown Selector */}
				<div className="space-y-4 md:hidden">
					<SourceSelectorDropdown
						onValueChange={(value) =>
							setSelectedSource(value as "upload" | "url" | "text")
						}
						value={selectedSource}
					/>
					{/* Conditionally render selected input based on dropdown */}
					{selectedSource === "upload" && (
						<SourceUploader
							bancaId={bancaId}
							onUploadSuccess={handleAddSuccess}
						/>
					)}
					{selectedSource === "url" && (
						<SourceUrlInput bancaId={bancaId} onAddSuccess={handleAddSuccess} />
					)}
					{selectedSource === "text" && (
						<SourceTextInput
							bancaId={bancaId}
							onAddSuccess={handleAddSuccess}
						/>
					)}
				</div>

				{/* Desktop: Tabs (existing pattern) */}
				<Tabs
					className="hidden w-full md:block"
					onValueChange={(value) =>
						setSelectedSource(value as "upload" | "url" | "text")
					}
					value={selectedSource}
				>
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
			<div className="max-h-82 flex-1 overflow-y-auto md:max-h-full">
				<div className="space-y-3 p-3 md:space-y-4 md:p-4">
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="size-6 animate-spin text-muted-foreground" />
						</div>
					) : sources.length === 0 ? (
						<div className="rounded-lg border border-dashed p-6 text-center md:p-8">
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
			</div>

			{/* Difficulty Selector */}
			<div className="border-t p-3 md:p-4">
				<DifficultySelector
					disabled={isGenerating}
					isPro={generationStatus?.isPro ?? false}
					onChange={setSelectedDifficulty}
					value={selectedDifficulty}
				/>
			</div>

			{/* Generate Button */}
			<div className="border-t p-3 md:p-4">
				<GenerateButton
					className="w-full"
					disabled={completedSources.length === 0 || isGenerating}
					isLoading={isGenerating}
					onClick={handleGenerate}
					remainingGenerations={generationStatus?.remainingGenerations}
					resetsAt={generationStatus?.resetsAt}
				>
					<span className="hidden sm:inline">
						{isGenerating
							? "Generating..."
							: `Generate Questions (${completedSources.length} sources)`}
					</span>
					<span className="sm:hidden">
						{isGenerating
							? "Generating..."
							: `Generate (${completedSources.length})`}
					</span>
				</GenerateButton>
			</div>
		</div>
	);
}
