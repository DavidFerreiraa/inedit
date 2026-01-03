import Anthropic from "@anthropic-ai/sdk";
import type { InferInsertModel } from "drizzle-orm";
import { and, desc, eq, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/env";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import {
	difficultyEnum,
	questionOptions,
	questionStatusEnum,
	questions,
	sources,
	userAnswers,
} from "@/server/db/schema";

type InsertQuestion = InferInsertModel<typeof questions>;
type InsertQuestionOption = InferInsertModel<typeof questionOptions>;

// Initialize Anthropic client
const anthropic = new Anthropic({
	apiKey: env.ANTHROPIC_API_KEY,
});

// Schema for generating questions
const generateQuestionsSchema = z.object({
	sourceIds: z.array(z.number()).min(1),
	count: z.number().int().min(1).max(20).default(5),
	difficulty: z.enum(difficultyEnum.enumValues).optional(),
	tags: z.array(z.string()).optional(),
	systemPrompt: z.string().optional(),
});

// GET /api/banca/[id]/questions - Fetch questions for a banca
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: bancaId } = await params;
		const { searchParams } = new URL(request.url);

		// Parse query parameters
		const limit = Number.parseInt(searchParams.get("limit") ?? "20", 10);
		const offset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
		const difficulty = searchParams.get("difficulty");
		const status = searchParams.get("status");

		// Build where conditions
		const conditions = [
			eq(questions.bancaId, bancaId),
			eq(questions.userId, session.user.id),
		];

		// Apply filters
		if (
			difficulty &&
			difficultyEnum.enumValues.includes(
				difficulty as (typeof difficultyEnum.enumValues)[number],
			)
		) {
			conditions.push(
				eq(
					questions.difficulty,
					difficulty as (typeof difficultyEnum.enumValues)[number],
				),
			);
		}

		// Default to published if no status param provided
		if (!status) {
			conditions.push(eq(questions.status, "published"));
		} else if (
			questionStatusEnum.enumValues.includes(
				status as (typeof questionStatusEnum.enumValues)[number],
			)
		) {
			conditions.push(
				eq(
					questions.status,
					status as (typeof questionStatusEnum.enumValues)[number],
				),
			);
		}

		// Execute query
		const userQuestions = await db
			.select()
			.from(questions)
			.where(and(...conditions))
			.orderBy(desc(questions.createdAt))
			.limit(limit)
			.offset(offset);

		// Fetch options and user answers for each question
		const questionsWithOptions = await Promise.all(
			userQuestions.map(async (question) => {
				const options = await db
					.select()
					.from(questionOptions)
					.where(eq(questionOptions.questionId, question.id))
					.orderBy(questionOptions.displayOrder);

				// Fetch ALL user answers for this question to calculate statistics
				const userAnswersList = await db
					.select()
					.from(userAnswers)
					.where(
						and(
							eq(userAnswers.questionId, question.id),
							eq(userAnswers.userId, session.user.id),
						),
					)
					.orderBy(userAnswers.answeredAt);

				// Calculate answer statistics
				const totalAttempts = userAnswersList.length;
				const correctAttempts = userAnswersList.filter(
					(a) => a.isCorrect,
				).length;
				const incorrectAttempts = totalAttempts - correctAttempts;
				const latestAnswer =
					userAnswersList[userAnswersList.length - 1] ?? null;

				return {
					...question,
					options,
					userAnswer: latestAnswer, // Latest answer for backward compatibility
					answerStats: {
						totalAttempts,
						correctAttempts,
						incorrectAttempts,
					},
				};
			}),
		);

		return NextResponse.json({ questions: questionsWithOptions });
	} catch (error) {
		console.error("Error fetching questions:", error);
		return NextResponse.json(
			{ error: "Failed to fetch questions" },
			{ status: 500 },
		);
	}
}

// POST /api/banca/[id]/questions - Generate new questions with AI
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: bancaId } = await params;
		const body = await request.json();
		const validatedData = generateQuestionsSchema.parse(body);

		// Fetch source content
		const sourcesData = await db
			.select()
			.from(sources)
			.where(
				and(
					inArray(sources.id, validatedData.sourceIds),
					eq(sources.userId, session.user.id),
					eq(sources.bancaId, bancaId),
				),
			);

		if (sourcesData.length === 0) {
			return NextResponse.json(
				{ error: "No valid sources found" },
				{ status: 404 },
			);
		}

		// Combine source content
		const sourceContent = sourcesData
			.map(
				(source) =>
					`Source: ${source.title}\n${source.extractedText ?? source.content ?? ""}`,
			)
			.join("\n\n---\n\n");

		// Generate questions with Claude
		const prompt = `You are an expert in creating CEBRASPE-style exam questions (Certo/Errado format).

Based on the following source material, generate ${validatedData.count} high-quality multiple-choice questions with TWO options: "Certo" (Correct) and "Errado" (Wrong).

${validatedData.difficulty ? `Difficulty level: ${validatedData.difficulty}` : ""}
${validatedData.tags ? `Topics to focus on: ${validatedData.tags.join(", ")}` : ""}

Source Material:
${sourceContent}

For each question, provide:
1. A clear, concise title (question statement)
2. A brief description providing context
3. The correct answer (either "Certo" or "Errado")
4. A detailed explanation of why the answer is correct
5. 3-5 relevant tags (topics/concepts)
6. Difficulty level (easy, medium, or hard)

Format your response as a JSON array of questions with this structure:
[
  {
    "title": "Question statement here",
    "description": "Context or additional details",
    "correctAnswer": "Certo" or "Errado",
    "explanation": "Detailed explanation",
    "tags": ["tag1", "tag2", "tag3"],
    "difficulty": "medium"
  }
]

Generate exactly ${validatedData.count} questions.`;

		const message = await anthropic.messages.create({
			model: "claude-sonnet-4-20250514",
			max_tokens: 8192,
			...(validatedData.systemPrompt && { system: validatedData.systemPrompt }),
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
		});

		// Parse AI response
		const responseText =
			message.content[0]?.type === "text" ? message.content[0].text : "";

		// Extract JSON from response
		const jsonMatch = responseText.match(/\[[\s\S]*\]/);
		if (!jsonMatch) {
			throw new Error("Failed to parse AI response");
		}

		const generatedQuestions = JSON.parse(jsonMatch[0]) as Array<{
			title: string;
			description: string;
			correctAnswer: "Certo" | "Errado";
			explanation: string;
			tags: string[];
			difficulty: "easy" | "medium" | "hard";
		}>;

		// Save questions to database
		const savedQuestions = await Promise.all(
			generatedQuestions.map(async (q) => {
				const questionData: InsertQuestion = {
					userId: session.user.id,
					bancaId,
					title: q.title,
					description: q.description,
					difficulty: q.difficulty,
					status: "draft",
					tags: q.tags,
					generatedFromSourceIds: validatedData.sourceIds,
					aiPrompt: prompt,
					aiModel: "claude-sonnet-4-20250514",
					aiTokensUsed:
						message.usage.input_tokens + message.usage.output_tokens,
					explanation: q.explanation,
					timesAnswered: 0,
					correctAnswerRate: 0,
					createdAt: new Date(),
				};

				const [insertedQuestion] = await db
					.insert(questions)
					.values(questionData)
					.returning();

				if (!insertedQuestion) {
					throw new Error("Failed to insert question");
				}

				// Create options (Certo and Errado)
				const options: InsertQuestionOption[] = [
					{
						questionId: insertedQuestion.id,
						label: "Certo",
						isCorrect: q.correctAnswer === "Certo",
						displayOrder: 1,
						createdAt: new Date(),
					},
					{
						questionId: insertedQuestion.id,
						label: "Errado",
						isCorrect: q.correctAnswer === "Errado",
						displayOrder: 2,
						createdAt: new Date(),
					},
				];

				const insertedOptions = await db
					.insert(questionOptions)
					.values(options)
					.returning();

				return {
					...insertedQuestion,
					options: insertedOptions,
				};
			}),
		);

		return NextResponse.json(
			{
				questions: savedQuestions,
				tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
			},
			{ status: 201 },
		);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error generating questions:", error);
		return NextResponse.json(
			{ error: "Failed to generate questions" },
			{ status: 500 },
		);
	}
}
