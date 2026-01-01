import { put } from "@vercel/blob";
import type { InferInsertModel } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { sources, sourceTypeEnum } from "@/server/db/schema";

type InsertSource = InferInsertModel<typeof sources>;

// Schema for creating a source
const createSourceSchema = z.object({
	type: z.enum(sourceTypeEnum.enumValues),
	title: z.string().min(1).max(500),
	content: z.string().optional(),
	url: z.string().url().optional(),
	fileName: z.string().max(500).optional(),
	fileSize: z.number().int().positive().optional(),
	mimeType: z.string().max(100).optional(),
});

// GET /api/banca/[id]/sources - Fetch all sources for a banca
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Get the session
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: bancaId } = await params;

		// Fetch sources for this banca and user
		const userSources = await db
			.select()
			.from(sources)
			.where(
				and(eq(sources.bancaId, bancaId), eq(sources.userId, session.user.id)),
			)
			.orderBy(sources.createdAt);

		return NextResponse.json({ sources: userSources });
	} catch (error) {
		console.error("Error fetching sources:", error);
		return NextResponse.json(
			{ error: "Failed to fetch sources" },
			{ status: 500 },
		);
	}
}

// POST /api/banca/[id]/sources - Create a new source
export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		// Get the session
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: bancaId } = await params;

		// Check if this is a file upload (multipart/form-data) or JSON
		const contentType = request.headers.get("content-type");

		if (contentType?.includes("multipart/form-data")) {
			// Handle file upload
			const formData = await request.formData();
			const file = formData.get("file") as File | null;

			if (!file) {
				return NextResponse.json(
					{ error: "No file provided" },
					{ status: 400 },
				);
			}

			// Check if BLOB_READ_WRITE_TOKEN is configured
			if (!process.env.BLOB_READ_WRITE_TOKEN) {
				return NextResponse.json(
					{
						error:
							"File upload is not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.",
					},
					{ status: 500 },
				);
			}

			// Upload to Vercel Blob
			const blob = await put(file.name, file, {
				access: "public",
				addRandomSuffix: true,
			});

			// Create source record
			const newSource: InsertSource = {
				userId: session.user.id,
				bancaId,
				type: "file",
				title: file.name,
				blobUrl: blob.url,
				blobKey: blob.pathname,
				fileName: file.name,
				fileSize: file.size,
				mimeType: file.type,
				processingStatus: "completed", // TODO: Implement background processing
				createdAt: new Date(),
			};

			const [insertedSource] = await db
				.insert(sources)
				.values(newSource)
				.returning();

			return NextResponse.json({ source: insertedSource }, { status: 201 });
		}

		// Handle JSON request (URL or text source)
		const body = await request.json();
		const validatedData = createSourceSchema.parse(body);

		const newSource: InsertSource = {
			userId: session.user.id,
			bancaId,
			type: validatedData.type,
			title: validatedData.title,
			content: validatedData.content,
			url: validatedData.url,
			processingStatus: "completed", // TODO: Implement background processing for URLs
			createdAt: new Date(),
		};

		const [insertedSource] = await db
			.insert(sources)
			.values(newSource)
			.returning();

		return NextResponse.json({ source: insertedSource }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error creating source:", error);
		return NextResponse.json(
			{ error: "Failed to create source" },
			{ status: 500 },
		);
	}
}

// DELETE /api/banca/[id]/sources - Delete a source
export async function DELETE(request: NextRequest) {
	try {
		// Get the session
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const sourceId = searchParams.get("sourceId");

		if (!sourceId) {
			return NextResponse.json(
				{ error: "Source ID is required" },
				{ status: 400 },
			);
		}

		// Delete the source (only if it belongs to the user)
		await db
			.delete(sources)
			.where(
				and(
					eq(sources.id, Number.parseInt(sourceId, 10)),
					eq(sources.userId, session.user.id),
				),
			);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting source:", error);
		return NextResponse.json(
			{ error: "Failed to delete source" },
			{ status: 500 },
		);
	}
}
