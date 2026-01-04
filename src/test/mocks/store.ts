import { vi } from "vitest";

export const createMockBancaStore = () => ({
	currentQuestionIndex: 0,
	setCurrentQuestionIndex: vi.fn(),
	selectedAnswerOptionId: null as number | null,
	setSelectedAnswerOptionId: vi.fn(),
	showExplanation: false,
	toggleExplanation: vi.fn(),
	previewMode: false,
	setPreviewMode: vi.fn(),
	previewQuestionIds: [] as number[],
	setPreviewQuestionIds: vi.fn(),
	clearPreview: vi.fn(),
	reset: vi.fn(),
});

export type MockBancaStore = ReturnType<typeof createMockBancaStore>;
