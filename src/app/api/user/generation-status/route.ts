import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import {
	getGenerationLimit,
	getRemainingCredits,
	isProOrAbove,
	type UserRole,
} from "@/lib/constants/generation-limits";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

// GET /api/user/generation-status - Get user's credit status
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
				creditsUsed: user.creditsUsed,
				creditsGranted: user.creditsGranted,
				role: user.role,
			})
			.from(user)
			.where(eq(user.id, session.user.id));

		if (!userData) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Get user role and calculate credits
		const userRole = (userData.role ?? "free") as UserRole;
		const creditLimit = userData.creditsGranted ?? getGenerationLimit(userRole);
		const remainingCredits = getRemainingCredits(
			userRole,
			userData.creditsUsed,
			userData.creditsGranted,
		);

		return NextResponse.json({
			remainingCredits,
			creditLimit,
			creditsUsed: userData.creditsUsed,
			role: userRole,
			isPro: isProOrAbove(userRole),
			canSelectDifficulty: isProOrAbove(userRole),
			canUpgrade: userRole === "free",
		});
	} catch (error) {
		console.error("Error fetching credit status:", error);
		return NextResponse.json(
			{ error: "Failed to fetch credit status" },
			{ status: 500 },
		);
	}
}
