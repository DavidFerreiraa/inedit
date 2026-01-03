import { and, eq, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { questionOptions, questions } from "@/server/db/schema";

const draftActionSchema = z.object({
	questionIds: z.array(z.number()).min(1),
});

// POST - Publish drafts (update status from "draft" to "published")
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
		const validatedData = draftActionSchema.parse(body);

		// Validate questions belong to user and are drafts
		const questionsToPublish = await db
			.select()
			.from(questions)
			.where(
				and(
					inArray(questions.id, validatedData.questionIds),
					eq(questions.userId, session.user.id),
					eq(questions.bancaId, bancaId),
					eq(questions.status, "draft"),
				),
			);

		if (questionsToPublish.length === 0) {
			return NextResponse.json(
				{ error: "No valid draft questions found" },
				{ status: 404 },
			);
		}

		// Update status to "published"
		const updatedQuestions = await db
			.update(questions)
			.set({ status: "published", updatedAt: new Date() })
			.where(
				and(
					inArray(questions.id, validatedData.questionIds),
					eq(questions.userId, session.user.id),
					eq(questions.bancaId, bancaId),
					eq(questions.status, "draft"),
				),
			)
			.returning();

		return NextResponse.json({
			questions: updatedQuestions,
			message: `Successfully published ${updatedQuestions.length} questions`,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error publishing drafts:", error);
		return NextResponse.json(
			{ error: "Failed to publish drafts" },
			{ status: 500 },
		);
	}
}

// DELETE - Discard drafts (delete questions and their options)
export async function DELETE(
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
		const validatedData = draftActionSchema.parse(body);

		// Validate questions belong to user
		const questionsToDelete = await db
			.select()
			.from(questions)
			.where(
				and(
					inArray(questions.id, validatedData.questionIds),
					eq(questions.userId, session.user.id),
					eq(questions.bancaId, bancaId),
				),
			);

		if (questionsToDelete.length === 0) {
			return NextResponse.json(
				{ error: "No valid questions found" },
				{ status: 404 },
			);
		}

		// Delete from questionOptions first (foreign key constraint)
		await db
			.delete(questionOptions)
			.where(inArray(questionOptions.questionId, validatedData.questionIds));

		// Delete from questions
		await db
			.delete(questions)
			.where(
				and(
					inArray(questions.id, validatedData.questionIds),
					eq(questions.userId, session.user.id),
					eq(questions.bancaId, bancaId),
				),
			);

		return NextResponse.json({
			success: true,
			message: `Successfully deleted ${questionsToDelete.length} questions`,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error deleting drafts:", error);
		return NextResponse.json(
			{ error: "Failed to delete drafts" },
			{ status: 500 },
		);
	}
}
