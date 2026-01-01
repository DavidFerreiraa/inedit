import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { questionOptions, questions } from "@/server/db/schema";

// GET /api/banca/[id]/questions/[questionId] - Fetch a single question
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

		// Fetch question
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

		// Fetch options
		const options = await db
			.select()
			.from(questionOptions)
			.where(eq(questionOptions.questionId, question.id))
			.orderBy(questionOptions.displayOrder);

		return NextResponse.json({
			question: {
				...question,
				options,
			},
		});
	} catch (error) {
		console.error("Error fetching question:", error);
		return NextResponse.json(
			{ error: "Failed to fetch question" },
			{ status: 500 },
		);
	}
}

// DELETE /api/banca/[id]/questions/[questionId] - Delete a question
export async function DELETE(
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

		// Delete the question (cascade will handle options)
		await db
			.delete(questions)
			.where(
				and(
					eq(questions.id, Number.parseInt(questionId, 10)),
					eq(questions.userId, session.user.id),
				),
			);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting question:", error);
		return NextResponse.json(
			{ error: "Failed to delete question" },
			{ status: 500 },
		);
	}
}
