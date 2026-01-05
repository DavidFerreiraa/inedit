import { desc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/constants/generation-limits";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

// GET /api/admin/users - List all users (admin only)
export async function GET(request: NextRequest) {
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

		// Fetch all users
		const users = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
			})
			.from(user)
			.orderBy(desc(user.createdAt));

		return NextResponse.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 },
		);
	}
}
