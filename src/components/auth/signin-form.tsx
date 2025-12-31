"use client";

import { Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/server/better-auth/client";

const signInSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormErrors = {
	email?: string;
	password?: string;
};

export function SignInForm() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [globalError, setGlobalError] = useState("");

	const handleEmailSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setGlobalError("");
		setIsLoading(true);

		const result = signInSchema.safeParse({ email, password });
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			setErrors({
				email: fieldErrors.email?.[0],
				password: fieldErrors.password?.[0],
			});
			setIsLoading(false);
			return;
		}

		try {
			await authClient.signIn.email({
				email,
				password,
				callbackURL: "/",
			});
			router.push("/");
		} catch (error) {
			setGlobalError(error instanceof Error ? error.message : "Sign in failed");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSocialSignIn = async (provider: "github" | "google") => {
		setIsLoading(true);
		setGlobalError("");

		try {
			await authClient.signIn.social({
				provider,
				callbackURL: "/",
			});
		} catch (_error) {
			setGlobalError(`${provider} sign-in failed`);
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<form className="space-y-3" onSubmit={handleEmailSignIn}>
				{globalError && (
					<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
						{globalError}
					</div>
				)}

				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						className={errors.email ? "border-destructive" : ""}
						disabled={isLoading}
						id="email"
						onChange={(e) => setEmail(e.target.value)}
						placeholder="you@example.com"
						type="email"
						value={email}
					/>
					{errors.email && (
						<p className="text-destructive text-sm">{errors.email}</p>
					)}
				</div>

				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						className={errors.password ? "border-destructive" : ""}
						disabled={isLoading}
						id="password"
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						value={password}
					/>
					{errors.password && (
						<p className="text-destructive text-sm">{errors.password}</p>
					)}
				</div>

				<Button className="w-full" disabled={isLoading} type="submit">
					{isLoading ? "Signing in..." : "Sign in with Email"}
				</Button>
			</form>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<Separator />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<Button
					disabled={isLoading}
					onClick={() => handleSocialSignIn("google")}
					variant="outline"
				>
					<svg aria-hidden="true" className="mr-2 h-4 w-4" viewBox="0 0 24 24">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="currentColor"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="currentColor"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="currentColor"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="currentColor"
						/>
					</svg>
					Google
				</Button>
				<Button
					disabled={isLoading}
					onClick={() => handleSocialSignIn("github")}
					variant="outline"
				>
					<Github className="mr-2 h-4 w-4" />
					GitHub
				</Button>
			</div>
		</div>
	);
}
