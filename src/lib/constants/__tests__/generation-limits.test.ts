import { describe, expect, it } from "vitest";
import {
	GENERATION_LIMITS,
	getGenerationLimit,
	isAdmin,
	isProOrAbove,
	type UserRole,
} from "../generation-limits";

describe("generation-limits", () => {
	describe("GENERATION_LIMITS constant", () => {
		it("should have correct limit for free users", () => {
			expect(GENERATION_LIMITS.free).toBe(2);
		});

		it("should have correct limit for pro users", () => {
			expect(GENERATION_LIMITS.pro).toBe(10);
		});

		it("should have unlimited limit for admin users", () => {
			expect(GENERATION_LIMITS.admin).toBe(Number.POSITIVE_INFINITY);
		});
	});

	describe("getGenerationLimit", () => {
		it("should return 2 for free role", () => {
			const limit = getGenerationLimit("free");
			expect(limit).toBe(2);
		});

		it("should return 10 for pro role", () => {
			const limit = getGenerationLimit("pro");
			expect(limit).toBe(10);
		});

		it("should return Infinity for admin role", () => {
			const limit = getGenerationLimit("admin");
			expect(limit).toBe(Number.POSITIVE_INFINITY);
		});
	});

	describe("isProOrAbove", () => {
		it("should return false for free role", () => {
			const result = isProOrAbove("free");
			expect(result).toBe(false);
		});

		it("should return true for pro role", () => {
			const result = isProOrAbove("pro");
			expect(result).toBe(true);
		});

		it("should return true for admin role", () => {
			const result = isProOrAbove("admin");
			expect(result).toBe(true);
		});
	});

	describe("isAdmin", () => {
		it("should return false for free role", () => {
			const result = isAdmin("free");
			expect(result).toBe(false);
		});

		it("should return false for pro role", () => {
			const result = isAdmin("pro");
			expect(result).toBe(false);
		});

		it("should return true for admin role", () => {
			const result = isAdmin("admin");
			expect(result).toBe(true);
		});
	});

	describe("role hierarchy", () => {
		const roles: UserRole[] = ["free", "pro", "admin"];

		it("should have increasing generation limits", () => {
			const limits = roles.map(getGenerationLimit);
			// Free < Pro < Admin (Infinity)
			expect(limits[0]).toBeLessThan(limits[1]);
			expect(limits[1]).toBeLessThan(limits[2]);
		});

		it("should correctly identify pro and above users", () => {
			const proOrAbove = roles.map(isProOrAbove);
			expect(proOrAbove).toEqual([false, true, true]);
		});

		it("should only identify admin users", () => {
			const admins = roles.map(isAdmin);
			expect(admins).toEqual([false, false, true]);
		});
	});
});
