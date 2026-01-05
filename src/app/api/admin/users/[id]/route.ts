import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin, type UserRole } from "@/lib/constants/generation-limits";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { user, userRoleEnum } from "@/server/db/schema";

const updateRoleSchema = z.object({
	role: z.enum(userRoleEnum.enumValues),
});

// PATCH /api/admin/users/[id] - Update user role (admin only)
export async function PATCH(
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

		// Verify admin role
		const [currentUser] = await db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.id, session.user.id));

		if (!currentUser || !isAdmin(currentUser.role)) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { id: targetUserId } = await params;

		// Parse and validate request body
		const body = await request.json();
		const validatedData = updateRoleSchema.parse(body);
		const newRole = validatedData.role as UserRole;

		// Prevent demoting self
		if (targetUserId === session.user.id && newRole !== "admin") {
			return NextResponse.json(
				{ error: "Cannot demote yourself" },
				{ status: 400 },
			);
		}

		// Update user role
		const [updatedUser] = await db
			.update(user)
			.set({
				role: newRole,
				updatedAt: new Date(),
			})
			.where(eq(user.id, targetUserId))
			.returning({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			});

		if (!updatedUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(updatedUser);
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: "Invalid request data", details: error.errors },
				{ status: 400 },
			);
		}

		console.error("Error updating user role:", error);
		return NextResponse.json(
			{ error: "Failed to update user role" },
			{ status: 500 },
		);
	}
}
