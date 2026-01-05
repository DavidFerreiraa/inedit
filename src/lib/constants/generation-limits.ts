export const GENERATION_LIMITS = {
	free: 2,
	pro: 10,
	admin: Number.POSITIVE_INFINITY,
} as const;

export type UserRole = "free" | "pro" | "admin";

export function getGenerationLimit(role: UserRole): number {
	return GENERATION_LIMITS[role];
}

/**
 * Calculate remaining credits for a user
 * @param role - User's role (free, pro, admin)
 * @param creditsUsed - Total credits consumed
 * @param creditsGranted - Custom credit override (null = use role default)
 * @returns Number of remaining credits
 */
export function getRemainingCredits(
	role: UserRole,
	creditsUsed: number,
	creditsGranted: number | null,
): number {
	const baseLimit = creditsGranted ?? GENERATION_LIMITS[role];
	return Math.max(0, baseLimit - creditsUsed);
}

/**
 * Check if user has credits available
 * @param role - User's role (free, pro, admin)
 * @param creditsUsed - Total credits consumed
 * @param creditsGranted - Custom credit override (null = use role default)
 * @returns True if user has credits remaining
 */
export function hasCredits(
	role: UserRole,
	creditsUsed: number,
	creditsGranted: number | null,
): boolean {
	return getRemainingCredits(role, creditsUsed, creditsGranted) > 0;
}

export function isProOrAbove(role: UserRole): boolean {
	return role === "pro" || role === "admin";
}

export function isAdmin(role: UserRole): boolean {
	return role === "admin";
}
