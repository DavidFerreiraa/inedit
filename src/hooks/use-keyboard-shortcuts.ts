import { useEffect } from "react";

interface KeyboardShortcutHandler {
	key: string;
	ctrlKey?: boolean;
	metaKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	handler: () => void;
	description: string;
}

interface UseKeyboardShortcutsOptions {
	shortcuts: KeyboardShortcutHandler[];
	enabled?: boolean;
}

export function useKeyboardShortcuts({
	shortcuts,
	enabled = true,
}: UseKeyboardShortcutsOptions) {
	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			// Find matching shortcut
			const matchingShortcut = shortcuts.find((shortcut) => {
				const keyMatches =
					event.key.toLowerCase() === shortcut.key.toLowerCase();
				const shiftMatches = shortcut.shiftKey
					? event.shiftKey
					: !event.shiftKey || shortcut.shiftKey === false;
				const altMatches = shortcut.altKey
					? event.altKey
					: !event.altKey || shortcut.altKey === false;

				// For Cmd/Ctrl shortcuts, either key should work
				const cmdCtrlMatches =
					shortcut.ctrlKey || shortcut.metaKey
						? event.ctrlKey || event.metaKey
						: true;

				return (
					keyMatches &&
					cmdCtrlMatches &&
					shiftMatches &&
					altMatches &&
					!(shortcut.ctrlKey || shortcut.metaKey) // Skip if specific ctrl/meta check already passed
				);
			});

			if (matchingShortcut) {
				event.preventDefault();
				matchingShortcut.handler();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [shortcuts, enabled]);
}

export const DEFAULT_SHORTCUTS = {
	FULLSCREEN: {
		key: "f",
		ctrlKey: true,
		metaKey: true,
		description: "Toggle fullscreen",
	},
	GENERATE: {
		key: "g",
		ctrlKey: true,
		metaKey: true,
		description: "Generate questions",
	},
	TOGGLE_EXPLANATION: {
		key: " ",
		description: "Toggle explanation",
	},
	PREVIOUS_QUESTION: {
		key: "ArrowLeft",
		description: "Previous question",
	},
	NEXT_QUESTION: {
		key: "ArrowRight",
		description: "Next question",
	},
	BOOKMARK: {
		key: "b",
		ctrlKey: true,
		metaKey: true,
		description: "Bookmark question",
	},
	HELP: {
		key: "/",
		ctrlKey: true,
		metaKey: true,
		description: "Show keyboard shortcuts",
	},
} as const;
