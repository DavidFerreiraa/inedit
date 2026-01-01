import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BancaStore {
	// UI State
	isFullscreen: boolean;
	panelSizes: {
		sources: number;
		questions: number;
	};

	// Current Question State
	currentQuestionIndex: number;
	selectedAnswerOptionId: number | null;
	showExplanation: boolean;

	// Filters
	difficultyFilter: "easy" | "medium" | "hard" | null;
	statusFilter: "draft" | "published" | "archived" | null;
	searchQuery: string;

	// Actions
	toggleFullscreen: () => void;
	setPanelSizes: (sources: number, questions: number) => void;
	setCurrentQuestionIndex: (index: number) => void;
	setSelectedAnswerOptionId: (id: number | null) => void;
	toggleExplanation: () => void;
	setDifficultyFilter: (difficulty: "easy" | "medium" | "hard" | null) => void;
	setStatusFilter: (status: "draft" | "published" | "archived" | null) => void;
	setSearchQuery: (query: string) => void;
	resetFilters: () => void;
}

export const useBancaStore = create<BancaStore>()(
	persist(
		(set) => ({
			// Initial State
			isFullscreen: false,
			panelSizes: {
				sources: 30,
				questions: 70,
			},
			currentQuestionIndex: 0,
			selectedAnswerOptionId: null,
			showExplanation: false,
			difficultyFilter: null,
			statusFilter: null,
			searchQuery: "",

			// Actions
			toggleFullscreen: () =>
				set((state) => ({ isFullscreen: !state.isFullscreen })),

			setPanelSizes: (sources, questions) =>
				set({ panelSizes: { sources, questions } }),

			setCurrentQuestionIndex: (index) =>
				set({
					currentQuestionIndex: index,
					selectedAnswerOptionId: null,
					showExplanation: false,
				}),

			setSelectedAnswerOptionId: (id) => set({ selectedAnswerOptionId: id }),

			toggleExplanation: () =>
				set((state) => ({ showExplanation: !state.showExplanation })),

			setDifficultyFilter: (difficulty) =>
				set({ difficultyFilter: difficulty }),

			setStatusFilter: (status) => set({ statusFilter: status }),

			setSearchQuery: (query) => set({ searchQuery: query }),

			resetFilters: () =>
				set({
					difficultyFilter: null,
					statusFilter: null,
					searchQuery: "",
				}),
		}),
		{
			name: "banca-store",
			partialize: (state) => ({
				panelSizes: state.panelSizes,
			}),
		},
	),
);
