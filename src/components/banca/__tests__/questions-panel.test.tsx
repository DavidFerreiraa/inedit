import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockQuestions } from "@/test/mocks/handlers";
import { server } from "@/test/mocks/server";
import { render, screen, waitFor } from "@/test/utils";
import { QuestionsPanel } from "../questions-panel";

// Mock the banca store
const mockStore = {
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
};

vi.mock("@/lib/stores/banca-store", () => ({
	useBancaStore: () => mockStore,
}));

// Mock child components
vi.mock("../question-card", () => ({
	QuestionCard: ({
		question,
		onAnswer,
		userAnswer,
		showExplanation,
	}: {
		question: { id: number; title: string };
		onAnswer: (optionId: number) => void;
		userAnswer: number | null;
		showExplanation: boolean;
	}) => (
		<div data-testid={`question-card-${question.id}`}>
			<h3>{question.title}</h3>
			<button
				data-testid="answer-button"
				onClick={() => onAnswer(1)}
				type="button"
			>
				Answer Option 1
			</button>
			{userAnswer && (
				<span data-testid="user-answer">Answered: {userAnswer}</span>
			)}
			{showExplanation && (
				<span data-testid="explanation">Explanation visible</span>
			)}
		</div>
	),
}));

vi.mock("../question-navigation", () => ({
	QuestionNavigation: ({
		currentIndex,
		totalQuestions,
		onPrevious,
		onNext,
		answeredCount,
	}: {
		currentIndex: number;
		totalQuestions: number;
		onPrevious: () => void;
		onNext: () => void;
		answeredCount: number;
	}) => (
		<div data-testid="question-navigation">
			<span data-testid="current-index">{currentIndex + 1}</span>
			<span data-testid="total-questions">{totalQuestions}</span>
			<span data-testid="answered-count">{answeredCount}</span>
			<button
				data-testid="prev-button"
				disabled={currentIndex === 0}
				onClick={onPrevious}
				type="button"
			>
				Previous
			</button>
			<button
				data-testid="next-button"
				disabled={currentIndex >= totalQuestions - 1}
				onClick={onNext}
				type="button"
			>
				Next
			</button>
		</div>
	),
}));

vi.mock("../preview-banner", () => ({
	PreviewBanner: () => <div data-testid="preview-banner">Preview Mode</div>,
}));

vi.mock("../preview-actions", () => ({
	PreviewActions: ({
		onSave,
		onDiscard,
		isLoading,
	}: {
		onSave: () => void;
		onDiscard: () => void;
		isLoading: boolean;
	}) => (
		<div data-testid="preview-actions">
			<button
				data-testid="save-button"
				disabled={isLoading}
				onClick={onSave}
				type="button"
			>
				Save
			</button>
			<button
				data-testid="discard-button"
				disabled={isLoading}
				onClick={onDiscard}
				type="button"
			>
				Discard
			</button>
		</div>
	),
}));

describe("QuestionsPanel", () => {
	const defaultProps = {
		bancaId: "banca-1",
	};

	beforeEach(() => {
		// Reset mock store state
		mockStore.currentQuestionIndex = 0;
		mockStore.selectedAnswerOptionId = null;
		mockStore.showExplanation = false;
		mockStore.previewMode = false;
		mockStore.previewQuestionIds = [];

		// Reset mock functions
		vi.clearAllMocks();
	});

	describe("Loading state", () => {
		it("shows loading skeleton on initial render", () => {
			// Delay the response to see loading state
			server.use(
				http.get("/api/banca/:bancaId/questions", async () => {
					await new Promise((resolve) => setTimeout(resolve, 100));
					return HttpResponse.json({ questions: mockQuestions });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			// Should show skeleton elements (they have data-slot="skeleton")
			const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
			expect(skeletons.length).toBeGreaterThan(0);
		});
	});

	describe("Error state", () => {
		it("shows error alert when fetch fails", async () => {
			server.use(
				http.get("/api/banca/:bancaId/questions", () => {
					return HttpResponse.error();
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(
					screen.getByText(
						"Erro ao carregar questões. Por favor, tente novamente.",
					),
				).toBeInTheDocument();
			});
		});
	});

	describe("Empty state", () => {
		it("shows empty state when no questions", async () => {
			server.use(
				http.get("/api/banca/:bancaId/questions", () => {
					return HttpResponse.json({ questions: [] });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(
					screen.getByText("Nenhuma questão gerada ainda"),
				).toBeInTheDocument();
				expect(
					screen.getByText(
						'Adicione fontes e clique em "Gerar Questões" para começar',
					),
				).toBeInTheDocument();
			});
		});
	});

	describe("Questions display", () => {
		it("renders current question with QuestionCard", async () => {
			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("question-card-1")).toBeInTheDocument();
				expect(
					screen.getByText("What is the capital of France?"),
				).toBeInTheDocument();
			});
		});

		it("displays question navigation", async () => {
			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("question-navigation")).toBeInTheDocument();
				expect(screen.getByTestId("current-index")).toHaveTextContent("1");
				expect(screen.getByTestId("total-questions")).toHaveTextContent("2");
			});
		});
	});

	describe("Navigation", () => {
		it("navigates to next question on handleNext", async () => {
			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("next-button")).toBeInTheDocument();
			});

			screen.getByTestId("next-button").click();

			expect(mockStore.setCurrentQuestionIndex).toHaveBeenCalledWith(1);
		});

		it("navigates to previous question on handlePrevious", async () => {
			mockStore.currentQuestionIndex = 1;

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("prev-button")).toBeInTheDocument();
			});

			screen.getByTestId("prev-button").click();

			expect(mockStore.setCurrentQuestionIndex).toHaveBeenCalledWith(0);
		});

		it("disables previous button on first question", async () => {
			mockStore.currentQuestionIndex = 0;

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("prev-button")).toBeDisabled();
			});
		});
	});

	describe("Answer submission", () => {
		it("submits answer when option is selected", async () => {
			let answerSubmitted = false;

			server.use(
				http.post("/api/banca/:bancaId/questions/:questionId/answer", () => {
					answerSubmitted = true;
					return HttpResponse.json({ success: true, isCorrect: true });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("answer-button")).toBeInTheDocument();
			});

			screen.getByTestId("answer-button").click();

			await waitFor(() => {
				expect(answerSubmitted).toBe(true);
				expect(mockStore.setSelectedAnswerOptionId).toHaveBeenCalledWith(1);
			});
		});
	});

	describe("Question ID navigation", () => {
		it("navigates to specific question when questionId prop provided", async () => {
			render(<QuestionsPanel {...defaultProps} questionId={2} />);

			await waitFor(() => {
				// Should call setCurrentQuestionIndex to navigate to question with id 2
				expect(mockStore.setCurrentQuestionIndex).toHaveBeenCalled();
			});
		});

		it("clears selected answer when isEmptyAnswer is true", async () => {
			render(<QuestionsPanel {...defaultProps} isEmptyAnswer questionId={1} />);

			await waitFor(() => {
				expect(mockStore.setSelectedAnswerOptionId).toHaveBeenCalledWith(null);
			});
		});
	});

	describe("Preview mode", () => {
		beforeEach(() => {
			mockStore.previewMode = true;
			mockStore.previewQuestionIds = [3, 4];
		});

		it("shows preview mode banner when in preview mode", async () => {
			server.use(
				http.get("/api/banca/:bancaId/questions", ({ request }) => {
					const url = new URL(request.url);
					if (url.searchParams.get("status") === "draft") {
						return HttpResponse.json({
							questions: [
								{ ...mockQuestions[0], id: 3, status: "draft" },
								{ ...mockQuestions[1], id: 4, status: "draft" },
							],
						});
					}
					return HttpResponse.json({ questions: [] });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("preview-banner")).toBeInTheDocument();
			});
		});

		it("shows preview actions in preview mode", async () => {
			server.use(
				http.get("/api/banca/:bancaId/questions", ({ request }) => {
					const url = new URL(request.url);
					if (url.searchParams.get("status") === "draft") {
						return HttpResponse.json({
							questions: [{ ...mockQuestions[0], id: 3, status: "draft" }],
						});
					}
					return HttpResponse.json({ questions: [] });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("preview-actions")).toBeInTheDocument();
				expect(screen.getByTestId("save-button")).toBeInTheDocument();
				expect(screen.getByTestId("discard-button")).toBeInTheDocument();
			});
		});

		it("fetches draft questions in preview mode", async () => {
			let fetchedDraft = false;

			server.use(
				http.get("/api/banca/:bancaId/questions", ({ request }) => {
					const url = new URL(request.url);
					if (url.searchParams.get("status") === "draft") {
						fetchedDraft = true;
						return HttpResponse.json({
							questions: [{ ...mockQuestions[0], status: "draft" }],
						});
					}
					return HttpResponse.json({ questions: [] });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(fetchedDraft).toBe(true);
			});
		});
	});

	describe("Normal mode", () => {
		it("fetches published questions in normal mode", async () => {
			let fetchedPublished = false;

			server.use(
				http.get("/api/banca/:bancaId/questions", ({ request }) => {
					const url = new URL(request.url);
					if (url.searchParams.get("status") === "published") {
						fetchedPublished = true;
					}
					return HttpResponse.json({ questions: mockQuestions });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(fetchedPublished).toBe(true);
			});
		});
	});

	describe("Draft actions", () => {
		beforeEach(() => {
			mockStore.previewMode = true;
			mockStore.previewQuestionIds = [3];
		});

		it("publishes draft questions via mutation", async () => {
			let publishCalled = false;

			server.use(
				http.get("/api/banca/:bancaId/questions", ({ request }) => {
					const url = new URL(request.url);
					if (url.searchParams.get("status") === "draft") {
						return HttpResponse.json({
							questions: [{ ...mockQuestions[0], id: 3, status: "draft" }],
						});
					}
					return HttpResponse.json({ questions: [] });
				}),
				http.post("/api/banca/:bancaId/questions/drafts", () => {
					publishCalled = true;
					return HttpResponse.json({ success: true });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("save-button")).toBeInTheDocument();
			});

			screen.getByTestId("save-button").click();

			await waitFor(() => {
				expect(publishCalled).toBe(true);
			});
		});

		it("discards draft questions via mutation", async () => {
			let discardCalled = false;

			server.use(
				http.get("/api/banca/:bancaId/questions", ({ request }) => {
					const url = new URL(request.url);
					if (url.searchParams.get("status") === "draft") {
						return HttpResponse.json({
							questions: [{ ...mockQuestions[0], id: 3, status: "draft" }],
						});
					}
					return HttpResponse.json({ questions: [] });
				}),
				http.delete("/api/banca/:bancaId/questions/drafts", () => {
					discardCalled = true;
					return HttpResponse.json({ success: true });
				}),
			);

			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByTestId("discard-button")).toBeInTheDocument();
			});

			screen.getByTestId("discard-button").click();

			await waitFor(() => {
				expect(discardCalled).toBe(true);
			});
		});
	});

	describe("Header", () => {
		it("displays questions header", async () => {
			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByText("Questões")).toBeInTheDocument();
			});
		});

		it("shows view all link when not in preview mode", async () => {
			render(<QuestionsPanel {...defaultProps} />);

			await waitFor(() => {
				expect(screen.getByText(/Ver todas/)).toBeInTheDocument();
			});
		});
	});
});
