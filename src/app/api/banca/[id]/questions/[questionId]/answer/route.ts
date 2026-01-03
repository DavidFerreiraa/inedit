import type { InferInsertModel } from "drizzle-orm";
import { and, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { questionOptions, questions, userAnswers } from "@/server/db/schema";

type InsertUserAnswer = InferInsertModel<typeof userAnswers>;

// Schema for submitting an answer
const submitAnswerSchema = z.object({
	selectedOptionId: z.number(),
	timeSpentSeconds: z.number().int().positive().optional(),
});

// POST /api/banca/[id]/questions/[questionId]/answer - Submit an answer
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; questionId: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { questionId } = await params;
		const body = await request.json();
		const validatedData = submitAnswerSchema.parse(body);

		// Verify the question belongs to the user
		const [question] = await db
			.select()
			.from(questions)
			.where(
				and(
					eq(questions.id, Number.parseInt(questionId, 10)),
					eq(questions.userId, session.user.id),
				),
			);

		if (!question) {
			return NextResponse.json(
				{ error: "Question not found" },
				{ status: 404 },
			);
		}

		// Verify the selected option belongs to this question
		const [selectedOption] = await db
			.select()
			.from(questionOptions)
			.where(
				and(
					eq(questionOptions.id, validatedData.selectedOptionId),
					eq(questionOptions.questionId, Number.parseInt(questionId, 10)),
				),
			);

		if (!selectedOption) {
			return NextResponse.json({ error: "Invalid option" }, { status: 400 });
		}

		// Record the answer
		const answerData: InsertUserAnswer = {
			userId: session.user.id,
			questionId: Number.parseInt(questionId, 10),
			selectedOptionId: validatedData.selectedOptionId,
			isCorrect: selectedOption.isCorrect,
			timeSpentSeconds: validatedData.timeSpentSeconds,
			answeredAt: new Date(),
		};

		const [insertedAnswer] = await db
			.insert(userAnswers)
			.values(answerData)
			.returning();

		// Update question statistics
		await db
			.update(questions)
			.set({
				timesAnswered: sql`${questions.timesAnswered} + 1`,
				correctAnswerRate: sql`
					CASE
						WHEN ${questions.timesAnswered} = 0 THEN ${selectedOption.isCorrect ? 100 : 0}
						ELSE (
							(${questions.correctAnswerRate} * ${questions.timesAnswered} + ${selectedOption.isCorrect ? 100 : 0}) /
							(${questions.timesAnswered} + 1)
						)
					END
				`,
			})
			.where(eq(questions.id, Number.parseInt(questionId, 10)));

		return NextResponse.json({
			answer: insertedAnswer,
			isCorrect: selectedOption.isCorrect,
			correctOption: selectedOption.isCorrect
				? selectedOption
				: await db
						.select()
						.from(questionOptions)
						.where(
							and(
								eq(questionOptions.questionId, Number.parseInt(questionId, 10)),
								eq(questionOptions.isCorrect, true),
							),
						)
						.then((opts) => opts[0]),
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error submitting answer:", error);
		return NextResponse.json(
			{ error: "Failed to submit answer" },
			{ status: 500 },
		);
	}
}

// GET /api/banca/[id]/questions/[questionId]/answer - Get user's answer history statistics
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; questionId: string }> },
) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { questionId } = await params;
		const questionIdNum = Number.parseInt(questionId, 10);

		// Get all answer attempts for this user and question
		const answers = await db
			.select()
			.from(userAnswers)
			.where(
				and(
					eq(userAnswers.questionId, questionIdNum),
					eq(userAnswers.userId, session.user.id),
				),
			)
			.orderBy(userAnswers.answeredAt);

		const totalAttempts = answers.length;
		const correctAttempts = answers.filter((a) => a.isCorrect).length;
		const incorrectAttempts = totalAttempts - correctAttempts;
		const latestAnswer = answers[answers.length - 1] ?? null;

		return NextResponse.json({
			totalAttempts,
			correctAttempts,
			incorrectAttempts,
			latestAnswer,
			allAnswers: answers,
		});
	} catch (error) {
		console.error("Error fetching answer statistics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch answer statistics" },
			{ status: 500 },
		);
	}
}
