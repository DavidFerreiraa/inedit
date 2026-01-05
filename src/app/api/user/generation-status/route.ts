import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import {
	getGenerationLimit,
	isProOrAbove,
	type UserRole,
} from "@/lib/constants/generation-limits";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

// GET /api/user/generation-status - Get user's generation status
export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const [userData] = await db
			.select({
				dailyGenerationCount: user.dailyGenerationCount,
				lastGenerationDate: user.lastGenerationDate,
				role: user.role,
			})
			.from(user)
			.where(eq(user.id, session.user.id));

		if (!userData) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check if we need to reset the count (new day)
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const lastGenDate = userData.lastGenerationDate
			? new Date(userData.lastGenerationDate)
			: null;
		const lastGenDay = lastGenDate
			? new Date(
					lastGenDate.getFullYear(),
					lastGenDate.getMonth(),
					lastGenDate.getDate(),
				)
			: null;

		const isNewDay = !lastGenDay || lastGenDay.getTime() < today.getTime();
		const currentCount = isNewDay ? 0 : userData.dailyGenerationCount;

		// Get dynamic limit based on user role
		const userRole = (userData.role ?? "free") as UserRole;
		const dailyLimit = getGenerationLimit(userRole);
		const remainingGenerations = Math.max(0, dailyLimit - currentCount);

		// Calculate reset time (midnight tonight)
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		return NextResponse.json({
			remainingGenerations,
			dailyLimit,
			usedToday: currentCount,
			resetsAt: tomorrow.toISOString(),
			role: userRole,
			isPro: isProOrAbove(userRole),
			canSelectDifficulty: isProOrAbove(userRole),
		});
	} catch (error) {
		console.error("Error fetching generation status:", error);
		return NextResponse.json(
			{ error: "Failed to fetch generation status" },
			{ status: 500 },
		);
	}
}
