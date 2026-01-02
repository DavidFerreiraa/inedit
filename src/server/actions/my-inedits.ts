"use server";

import { desc, eq } from "drizzle-orm";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { bancas, questionOptions, questions } from "@/server/db/schema";

// ============================================================================
// TYPES
// ============================================================================

interface QuestionOption {
	id: number;
	label: string;
	isCorrect: boolean;
	displayOrder: number;
}

export interface IneditWithBanca {
	id: number;
	title: string;
	description: string | null;
	difficulty: "easy" | "medium" | "hard";
	status: "draft" | "published" | "archived";
	tags: string[];
	explanation: string | null;
	timesAnswered: number;
	correctAnswerRate: number;
	createdAt: Date;
	updatedAt: Date | null;
	banca: {
		id: string;
		name: string;
		description: string | null;
	};
	options: QuestionOption[];
}

export interface GroupedInedits {
	bancaId: string;
	bancaName: string;
	bancaDescription: string | null;
	questionCount: number;
	questions: IneditWithBanca[];
}

// ============================================================================
// SERVER ACTIONS
// ============================================================================

/**
 * Fetch all questions created by the authenticated user, grouped by banca
 */
export async function getMyInedits(): Promise<GroupedInedits[]> {
	// Get current session
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	});

	if (!session?.user) {
		return [];
	}

	try {
		// Fetch all user questions with banca information via INNER JOIN
		const userQuestions = await db
			.select({
				// Question fields
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
				// Banca fields
				bancaName: bancas.name,
				bancaDescription: bancas.description,
			})
			.from(questions)
			.innerJoin(bancas, eq(questions.bancaId, bancas.id))
			.where(eq(questions.userId, session.user.id))
			.orderBy(desc(questions.createdAt));

		// Fetch options for each question in parallel
		const questionsWithOptions = await Promise.all(
			userQuestions.map(async (q) => {
				const opts = await db
					.select({
						id: questionOptions.id,
						label: questionOptions.label,
						isCorrect: questionOptions.isCorrect,
						displayOrder: questionOptions.displayOrder,
					})
					.from(questionOptions)
					.where(eq(questionOptions.questionId, q.id))
					.orderBy(questionOptions.displayOrder);

				return {
					id: q.id,
					title: q.title,
					description: q.description,
					difficulty: q.difficulty,
					status: q.status,
					tags: (q.tags as string[]) || [],
					explanation: q.explanation,
					timesAnswered: q.timesAnswered,
					correctAnswerRate: q.correctAnswerRate,
					createdAt: q.createdAt,
					updatedAt: q.updatedAt,
					banca: {
						id: q.bancaId,
						name: q.bancaName,
						description: q.bancaDescription,
					},
					options: opts,
				} as IneditWithBanca;
			}),
		);

		// Group questions by banca
		const groupedMap = questionsWithOptions.reduce(
			(acc, question) => {
				const bancaId = question.banca.id;

				if (!acc[bancaId]) {
					acc[bancaId] = {
						bancaId,
						bancaName: question.banca.name,
						bancaDescription: question.banca.description,
						questionCount: 0,
						questions: [],
					};
				}

				acc[bancaId].questions.push(question);
				acc[bancaId].questionCount++;

				return acc;
			},
			{} as Record<string, GroupedInedits>,
		);

		// Convert to array and sort by banca name
		const grouped = Object.values(groupedMap).sort((a, b) =>
			a.bancaName.localeCompare(b.bancaName),
		);

		return grouped;
	} catch (error) {
		console.error("Error fetching user inedits:", error);
		return [];
	}
}

/**
 * Get all unique tags from user's questions
 */
export async function getAllUserTags(): Promise<string[]> {
	// Get current session
	const session = await auth.api.getSession({
		headers: await import("next/headers").then((mod) => mod.headers()),
	});

	if (!session?.user) {
		return [];
	}

	try {
		// Fetch all tags from user's questions
		const result = await db
			.select({ tags: questions.tags })
			.from(questions)
			.where(eq(questions.userId, session.user.id));

		// Flatten and deduplicate tags
		const allTags = result
			.flatMap((row) => (row.tags as string[]) || [])
			.filter((tag, index, self) => self.indexOf(tag) === index)
			.sort();

		return allTags;
	} catch (error) {
		console.error("Error fetching user tags:", error);
		return [];
	}
}
