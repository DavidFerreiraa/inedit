"use client";

import { useEffect } from "react";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useBancaStore } from "@/lib/stores/banca-store";

interface ResizableLayoutProps {
	bancaId: string;
	sourcesPanel: React.ReactNode;
	questionsPanel: React.ReactNode;
}

export function ResizableLayout({
	sourcesPanel,
	questionsPanel,
}: ResizableLayoutProps) {
	const { isFullscreen, panelSizes } = useBancaStore();

	// Handle keyboard shortcut for fullscreen toggle
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Cmd+F (Mac) or Ctrl+F (Windows/Linux)
			if ((e.metaKey || e.ctrlKey) && e.key === "f") {
				e.preventDefault();
				useBancaStore.getState().toggleFullscreen();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="h-[calc(100vh-4rem)] w-full">
			{isFullscreen ? (
				// Fullscreen mode - only show questions panel
				<div className="h-full w-full">{questionsPanel}</div>
			) : (
				// Split-pane mode
				<ResizablePanelGroup orientation="horizontal">
					{/* Sources Panel */}
					<ResizablePanel
						defaultSize={panelSizes.sources}
						id="sources-panel"
						maxSize={50}
						minSize={20}
					>
						{sourcesPanel}
					</ResizablePanel>

					{/* Resizable Handle */}
					<ResizableHandle withHandle />

					{/* Questions Panel */}
					<ResizablePanel
						defaultSize={panelSizes.questions}
						id="questions-panel"
						maxSize={80}
						minSize={50}
					>
						{questionsPanel}
					</ResizablePanel>
				</ResizablePanelGroup>
			)}
		</div>
	);
}
