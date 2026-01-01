import { and, avg, count, eq, sql } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { questions, userAnswers } from "@/server/db/schema";

// GET /api/banca/[id]/stats - Get user statistics for a banca
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

		// Get total questions answered
		const [totalAnswers] = await db
			.select({ count: count() })
			.from(userAnswers)
			.innerJoin(questions, eq(userAnswers.questionId, questions.id))
			.where(
				and(
					eq(userAnswers.userId, session.user.id),
					eq(questions.bancaId, bancaId),
				),
			);

		// Get correct answers count
		const [correctAnswers] = await db
			.select({ count: count() })
			.from(userAnswers)
			.innerJoin(questions, eq(userAnswers.questionId, questions.id))
			.where(
				and(
					eq(userAnswers.userId, session.user.id),
					eq(questions.bancaId, bancaId),
					eq(userAnswers.isCorrect, true),
				),
			);

		// Get average time spent
		const [avgTime] = await db
			.select({
				avgSeconds: avg(userAnswers.timeSpentSeconds),
			})
			.from(userAnswers)
			.innerJoin(questions, eq(userAnswers.questionId, questions.id))
			.where(
				and(
					eq(userAnswers.userId, session.user.id),
					eq(questions.bancaId, bancaId),
				),
			);

		// Get answers answered today
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const [answersToday] = await db
			.select({ count: count() })
			.from(userAnswers)
			.innerJoin(questions, eq(userAnswers.questionId, questions.id))
			.where(
				and(
					eq(userAnswers.userId, session.user.id),
					eq(questions.bancaId, bancaId),
					sql`${userAnswers.answeredAt} >= ${today}`,
				),
			);

		// Get performance by difficulty
		const performanceByDifficulty = await db
			.select({
				difficulty: questions.difficulty,
				total: count(),
				correct: sql<number>`SUM(CASE WHEN ${userAnswers.isCorrect} THEN 1 ELSE 0 END)`,
			})
			.from(userAnswers)
			.innerJoin(questions, eq(userAnswers.questionId, questions.id))
			.where(
				and(
					eq(userAnswers.userId, session.user.id),
					eq(questions.bancaId, bancaId),
				),
			)
			.groupBy(questions.difficulty);

		// Calculate accuracy percentage
		const totalCount = totalAnswers?.count ?? 0;
		const correctCount = correctAnswers?.count ?? 0;
		const accuracyPercentage =
			totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

		return NextResponse.json({
			totalAnswered: totalCount,
			correctAnswers: correctCount,
			accuracyPercentage: Math.round(accuracyPercentage * 100) / 100,
			averageTimeSeconds: Math.round(Number(avgTime?.avgSeconds ?? 0)),
			answersToday: answersToday?.count ?? 0,
			performanceByDifficulty: performanceByDifficulty.map((p) => ({
				difficulty: p.difficulty,
				total: p.total,
				correct: Number(p.correct),
				percentage:
					p.total > 0
						? Math.round((Number(p.correct) / p.total) * 100 * 100) / 100
						: 0,
			})),
		});
	} catch (error) {
		console.error("Error fetching stats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch statistics" },
			{ status: 500 },
		);
	}
}
