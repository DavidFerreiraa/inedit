import { betterAuth, type CookieOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { env } from "@/env";

// Environment-aware cookie configuration
// Development (HTTP localhost): secure: false, sameSite: lax
// Production (HTTPS): secure: true, sameSite: none
const isProduction = process.env.NODE_ENV === "production";
const isLocalhost =
	env.BETTER_AUTH_URL.includes("localhost") ||
	env.BETTER_AUTH_URL.includes("127.0.0.1");

const cookieAttributes: CookieOptions =
	isProduction || !isLocalhost
		? { sameSite: "none", secure: true } // Production/HTTPS
		: { sameSite: "lax", secure: false }; // Development/HTTP

export const auth = betterAuth({
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql"
	}),
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [
		env.BETTER_AUTH_URL,
		env.BASE_URL ?? "http://localhost:3000",
	],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
			clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
		},
	},
	advanced: {
		cookiePrefix: "better-auth",
		defaultCookieAttributes: cookieAttributes,
	},
	account: {
		skipStateCookieCheck: true,
	},
});

export type Session = typeof auth.$Infer.Session;
