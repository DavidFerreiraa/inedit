"use client";

import { Keyboard } from "lucide-react";
import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface KeyboardShortcut {
	keys: string[];
	description: string;
	category: "Navigation" | "Actions" | "UI";
}

const SHORTCUTS: KeyboardShortcut[] = [
	{
		keys: ["Cmd", "F"],
		description: "Toggle fullscreen mode",
		category: "UI",
	},
	{
		keys: ["Cmd", "G"],
		description: "Generate questions from sources",
		category: "Actions",
	},
	{
		keys: ["Space"],
		description: "Toggle explanation visibility",
		category: "UI",
	},
	{
		keys: ["←"],
		description: "Previous question",
		category: "Navigation",
	},
	{
		keys: ["→"],
		description: "Next question",
		category: "Navigation",
	},
	{
		keys: ["Cmd", "B"],
		description: "Bookmark current question",
		category: "Actions",
	},
	{
		keys: ["Cmd", "/"],
		description: "Show this help dialog",
		category: "UI",
	},
	{
		keys: ["Esc"],
		description: "Close dialogs",
		category: "UI",
	},
];

function KeyBadge({ keyText }: { keyText: string }) {
	return (
		<kbd className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-border bg-muted px-2 font-mono font-semibold text-foreground text-xs">
			{keyText}
		</kbd>
	);
}

export function KeyboardShortcutsDialog() {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Cmd+/ or Ctrl+/ to toggle dialog
			if ((event.metaKey || event.ctrlKey) && event.key === "/") {
				event.preventDefault();
				setIsOpen((prev) => !prev);
			}
			// Escape to close
			if (event.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen]);

	const groupedShortcuts = SHORTCUTS.reduce(
		(acc, shortcut) => {
			if (!acc[shortcut.category]) {
				acc[shortcut.category] = [];
			}
			acc[shortcut.category]?.push(shortcut);
			return acc;
		},
		{} as Record<string, KeyboardShortcut[]>,
	);

	return (
		<Dialog onOpenChange={setIsOpen} open={isOpen}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<Keyboard className="h-5 w-5" />
						<DialogTitle>Atalhos de Teclado</DialogTitle>
					</div>
					<DialogDescription>
						Use estes atalhos para navegar mais rapidamente
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
						<div className="space-y-3" key={category}>
							<h3 className="font-semibold text-foreground text-sm">
								{category === "Navigation" && "Navegação"}
								{category === "Actions" && "Ações"}
								{category === "UI" && "Interface"}
							</h3>
							<div className="space-y-2">
								{shortcuts.map((shortcut) => (
									<div
										className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
										key={`${category}-${shortcut.description}`}
									>
										<span className="text-foreground text-sm">
											{shortcut.description}
										</span>
										<div className="flex items-center gap-1">
											{shortcut.keys.map((key) => (
												<span
													className="flex items-center gap-1"
													key={`${shortcut.description}-${key}`}
												>
													<KeyBadge keyText={key} />
													{key !== shortcut.keys[shortcut.keys.length - 1] && (
														<span className="text-muted-foreground">+</span>
													)}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				<div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
					<p className="text-blue-700 text-xs dark:text-blue-400">
						<strong>Dica:</strong> Use <KeyBadge keyText="Cmd" /> +{" "}
						<KeyBadge keyText="/" /> para abrir este diálogo a qualquer momento
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
