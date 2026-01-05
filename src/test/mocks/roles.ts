import type { UserRole } from "@/lib/constants/generation-limits";

// Mock users with different roles
export const mockFreeUser = {
	id: "user-free-1",
	name: "Free User",
	email: "free@example.com",
	role: "free" as UserRole,
	dailyGenerationCount: 0,
	lastGenerationDate: null,
	createdAt: new Date("2024-01-01").toISOString(),
	updatedAt: null,
	emailVerified: false,
	image: null,
};

export const mockProUser = {
	id: "user-pro-1",
	name: "PRO User",
	email: "pro@example.com",
	role: "pro" as UserRole,
	dailyGenerationCount: 0,
	lastGenerationDate: null,
	createdAt: new Date("2024-01-01").toISOString(),
	updatedAt: null,
	emailVerified: false,
	image: null,
};

export const mockAdminUser = {
	id: "user-admin-1",
	name: "Admin User",
	email: "admin@example.com",
	role: "admin" as UserRole,
	dailyGenerationCount: 0,
	lastGenerationDate: null,
	createdAt: new Date("2024-01-01").toISOString(),
	updatedAt: null,
	emailVerified: false,
	image: null,
};

// Mock sessions for different roles
export const mockFreeSession = {
	user: {
		id: mockFreeUser.id,
		name: mockFreeUser.name,
		email: mockFreeUser.email,
		image: mockFreeUser.image,
		emailVerified: mockFreeUser.emailVerified,
		createdAt: mockFreeUser.createdAt,
		updatedAt: mockFreeUser.updatedAt,
	},
	session: {
		id: "session-free-1",
		userId: mockFreeUser.id,
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		token: "token-free",
		ipAddress: "127.0.0.1",
		userAgent: "test-agent",
	},
};

export const mockProSession = {
	user: {
		id: mockProUser.id,
		name: mockProUser.name,
		email: mockProUser.email,
		image: mockProUser.image,
		emailVerified: mockProUser.emailVerified,
		createdAt: mockProUser.createdAt,
		updatedAt: mockProUser.updatedAt,
	},
	session: {
		id: "session-pro-1",
		userId: mockProUser.id,
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		token: "token-pro",
		ipAddress: "127.0.0.1",
		userAgent: "test-agent",
	},
};

export const mockAdminSession = {
	user: {
		id: mockAdminUser.id,
		name: mockAdminUser.name,
		email: mockAdminUser.email,
		image: mockAdminUser.image,
		emailVerified: mockAdminUser.emailVerified,
		createdAt: mockAdminUser.createdAt,
		updatedAt: mockAdminUser.updatedAt,
	},
	session: {
		id: "session-admin-1",
		userId: mockAdminUser.id,
		expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		token: "token-admin",
		ipAddress: "127.0.0.1",
		userAgent: "test-agent",
	},
};

// Mock generation status for different roles
export const mockGenerationStatusFree = {
	remainingGenerations: 2,
	dailyLimit: 2,
	usedToday: 0,
	resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
	role: "free" as UserRole,
	isPro: false,
	canSelectDifficulty: false,
};

export const mockGenerationStatusPro = {
	remainingGenerations: 10,
	dailyLimit: 10,
	usedToday: 0,
	resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
	role: "pro" as UserRole,
	isPro: true,
	canSelectDifficulty: true,
};

export const mockGenerationStatusAdmin = {
	remainingGenerations: Number.POSITIVE_INFINITY,
	dailyLimit: Number.POSITIVE_INFINITY,
	usedToday: 0,
	resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
	role: "admin" as UserRole,
	isPro: true,
	canSelectDifficulty: true,
};

// Helper to create generation status with custom usage
export function createMockGenerationStatus(
	role: UserRole,
	usedToday: number,
): typeof mockGenerationStatusFree {
	const baseStatus =
		role === "free"
			? mockGenerationStatusFree
			: role === "pro"
				? mockGenerationStatusPro
				: mockGenerationStatusAdmin;

	return {
		...baseStatus,
		usedToday,
		remainingGenerations: baseStatus.dailyLimit - usedToday,
	};
}

// Mock list of all users for admin panel
export const mockAllUsers = [
	{
		id: mockFreeUser.id,
		name: mockFreeUser.name,
		email: mockFreeUser.email,
		role: mockFreeUser.role,
		createdAt: mockFreeUser.createdAt,
	},
	{
		id: mockProUser.id,
		name: mockProUser.name,
		email: mockProUser.email,
		role: mockProUser.role,
		createdAt: mockProUser.createdAt,
	},
	{
		id: mockAdminUser.id,
		name: mockAdminUser.name,
		email: mockAdminUser.email,
		role: mockAdminUser.role,
		createdAt: mockAdminUser.createdAt,
	},
];
