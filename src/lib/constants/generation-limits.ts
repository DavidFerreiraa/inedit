export const GENERATION_LIMITS = {
	free: 2,
	pro: 10,
	admin: Number.POSITIVE_INFINITY,
} as const;

export type UserRole = "free" | "pro" | "admin";

export function getGenerationLimit(role: UserRole): number {
	return GENERATION_LIMITS[role];
}

export function isProOrAbove(role: UserRole): boolean {
	return role === "pro" || role === "admin";
}

export function isAdmin(role: UserRole): boolean {
	return role === "admin";
}
