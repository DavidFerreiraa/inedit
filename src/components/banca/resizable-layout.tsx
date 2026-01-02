"use client";

import { ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
	const {
		isFullscreen,
		panelSizes,
		isMobileQuestionsDrawerOpen,
		setMobileQuestionsDrawerOpen,
	} = useBancaStore();

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
				// Fullscreen mode - only show questions panel (all devices)
				<div className="h-full w-full">{questionsPanel}</div>
			) : (
				<>
					{/* Mobile Layout: Sources Panel with Sheet Drawer for Questions */}
					<div className="flex h-full md:hidden">
						{/* Sources Panel - Full width on mobile */}
						<div className="h-full w-full overflow-y-auto">{sourcesPanel}</div>

						{/* Questions Drawer - Sheet from right side */}
						<Sheet
							onOpenChange={setMobileQuestionsDrawerOpen}
							open={isMobileQuestionsDrawerOpen}
						>
							<SheetTrigger asChild>
								<Button
									className="fixed right-4 bottom-4 z-40 h-14 w-14 rounded-full shadow-lg"
									size="icon"
									variant="outline"
								>
									<ChevronRight className="h-6 w-6" />
								</Button>
							</SheetTrigger>
							<SheetContent className="w-full p-0 sm:max-w-full" side="right">
								{questionsPanel}
							</SheetContent>
						</Sheet>
					</div>

					{/* Desktop Layout: Resizable split-pane (unchanged) */}
					<div className="hidden h-full md:block">
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
					</div>
				</>
			)}
		</div>
	);
}
