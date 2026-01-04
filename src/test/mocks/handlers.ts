import { HttpResponse, http } from "msw";

// Default mock data
export const mockGenerationStatus = {
	remainingGenerations: 2,
	dailyLimit: 2,
	usedToday: 0,
	resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const mockSources = [
	{
		id: 1,
		type: "file" as const,
		title: "Test Document",
		content: "Test content",
		url: null,
		fileName: "test.pdf",
		processingStatus: "completed" as const,
		createdAt: new Date().toISOString(),
	},
	{
		id: 2,
		type: "url" as const,
		title: "Test URL",
		content: null,
		url: "https://example.com",
		fileName: null,
		processingStatus: "completed" as const,
		createdAt: new Date().toISOString(),
	},
	{
		id: 3,
		type: "text" as const,
		title: "Test Text",
		content: "Some text content",
		url: null,
		fileName: null,
		processingStatus: "pending" as const,
		createdAt: new Date().toISOString(),
	},
];

export const mockQuestions = [
	{
		id: 1,
		userId: "user-1",
		bancaId: "banca-1",
		title: "What is the capital of France?",
		description: "Geography question",
		difficulty: "easy" as const,
		status: "published" as const,
		tags: ["geography"],
		generatedFromSourceIds: [1],
		aiPrompt: null,
		aiModel: null,
		aiTokensUsed: null,
		explanation: "Paris is the capital of France.",
		timesAnswered: 10,
		correctAnswerRate: 0.8,
		createdAt: new Date().toISOString(),
		updatedAt: null,
		options: [
			{
				id: 1,
				questionId: 1,
				label: "Paris",
				isCorrect: true,
				displayOrder: 1,
				createdAt: new Date().toISOString(),
			},
			{
				id: 2,
				questionId: 1,
				label: "London",
				isCorrect: false,
				displayOrder: 2,
				createdAt: new Date().toISOString(),
			},
			{
				id: 3,
				questionId: 1,
				label: "Berlin",
				isCorrect: false,
				displayOrder: 3,
				createdAt: new Date().toISOString(),
			},
			{
				id: 4,
				questionId: 1,
				label: "Madrid",
				isCorrect: false,
				displayOrder: 4,
				createdAt: new Date().toISOString(),
			},
		],
		userAnswer: null,
		answerStats: {
			totalAttempts: 10,
			correctAttempts: 8,
			incorrectAttempts: 2,
		},
	},
	{
		id: 2,
		userId: "user-1",
		bancaId: "banca-1",
		title: "What is 2 + 2?",
		description: "Math question",
		difficulty: "easy" as const,
		status: "published" as const,
		tags: ["math"],
		generatedFromSourceIds: [1],
		aiPrompt: null,
		aiModel: null,
		aiTokensUsed: null,
		explanation: "2 + 2 equals 4.",
		timesAnswered: 5,
		correctAnswerRate: 1.0,
		createdAt: new Date().toISOString(),
		updatedAt: null,
		options: [
			{
				id: 5,
				questionId: 2,
				label: "3",
				isCorrect: false,
				displayOrder: 1,
				createdAt: new Date().toISOString(),
			},
			{
				id: 6,
				questionId: 2,
				label: "4",
				isCorrect: true,
				displayOrder: 2,
				createdAt: new Date().toISOString(),
			},
			{
				id: 7,
				questionId: 2,
				label: "5",
				isCorrect: false,
				displayOrder: 3,
				createdAt: new Date().toISOString(),
			},
			{
				id: 8,
				questionId: 2,
				label: "6",
				isCorrect: false,
				displayOrder: 4,
				createdAt: new Date().toISOString(),
			},
		],
		userAnswer: null,
		answerStats: { totalAttempts: 5, correctAttempts: 5, incorrectAttempts: 0 },
	},
];

export const handlers = [
	// Generation status
	http.get("/api/user/generation-status", () => {
		return HttpResponse.json(mockGenerationStatus);
	}),

	// Sources
	http.get("/api/banca/:bancaId/sources", () => {
		return HttpResponse.json({ sources: mockSources });
	}),

	// Questions (published)
	http.get("/api/banca/:bancaId/questions", ({ request }) => {
		const url = new URL(request.url);
		const status = url.searchParams.get("status");

		if (status === "draft") {
			return HttpResponse.json({ questions: [] });
		}

		return HttpResponse.json({ questions: mockQuestions });
	}),

	// Submit answer
	http.post(
		"/api/banca/:bancaId/questions/:questionId/answer",
		async ({ request }) => {
			const body = (await request.json()) as { selectedOptionId: number };
			const isCorrect =
				body.selectedOptionId === 1 || body.selectedOptionId === 6;

			return HttpResponse.json({
				success: true,
				isCorrect,
				correctOptionId: 1,
			});
		},
	),

	// Publish drafts
	http.post("/api/banca/:bancaId/questions/drafts", () => {
		return HttpResponse.json({ success: true, publishedCount: 2 });
	}),

	// Discard drafts
	http.delete("/api/banca/:bancaId/questions/drafts", () => {
		return HttpResponse.json({ success: true, deletedCount: 2 });
	}),
];
