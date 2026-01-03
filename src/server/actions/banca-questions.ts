"use server";

import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { bancas, questionOptions, questions } from "@/server/db/schema";
import type { IneditWithBanca } from "./my-inedits";

/**
 * Fetch all published questions for a specific banca
 */
export async function getBancaQuestions(
	bancaId: string,
): Promise<IneditWithBanca[]> {
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	});

	if (!session?.user) return [];

	try {
		const userQuestions = await db
			.select({
				id: questions.id,
				title: questions.title,
				description: questions.description,
				difficulty: questions.difficulty,
				status: questions.status,
				tags: questions.tags,
				explanation: questions.explanation,
				timesAnswered: questions.timesAnswered,
				correctAnswerRate: questions.correctAnswerRate,
				createdAt: questions.createdAt,
				updatedAt: questions.updatedAt,
				bancaId: questions.bancaId,
				bancaName: bancas.name,
				bancaDescription: bancas.description,
			})
			.from(questions)
			.innerJoin(bancas, eq(questions.bancaId, bancas.id))
			.where(
				and(
					eq(questions.userId, session.user.id),
					eq(questions.bancaId, bancaId),
					eq(questions.status, "published"),
				),
			)
			.orderBy(desc(questions.createdAt));

		const questionsWithOptions = await Promise.all(
			userQuestions.map(async (q) => {
				const opts = await db
					.select()
					.from(questionOptions)
					.where(eq(questionOptions.questionId, q.id))
					.orderBy(questionOptions.displayOrder);

				return {
					...q,
					tags: (q.tags as string[]) || [],
					banca: {
						id: q.bancaId,
						name: q.bancaName,
						description: q.bancaDescription,
					},
					options: opts,
				} as IneditWithBanca;
			}),
		);

		return questionsWithOptions;
	} catch (error) {
		console.error("Error fetching banca questions:", error);
		return [];
	}
}

/**
 * Get unique tags for a specific banca's questions
 */
export async function getBancaTags(bancaId: string): Promise<string[]> {
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	});

	if (!session?.user) return [];

	try {
		const result = await db
			.select({ tags: questions.tags })
			.from(questions)
			.where(
				and(
					eq(questions.userId, session.user.id),
					eq(questions.bancaId, bancaId),
					eq(questions.status, "published"),
				),
			);

		const allTags = result
			.flatMap((row) => (row.tags as string[]) || [])
			.filter((tag, index, self) => self.indexOf(tag) === index)
			.sort();

		return allTags;
	} catch (error) {
		console.error("Error fetching banca tags:", error);
		return [];
	}
}
