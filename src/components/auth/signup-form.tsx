"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/server/better-auth/client";

const signUpSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z
			.string()
			.min(8, "Password must be at least 8 characters"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type FormErrors = {
	name?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
};

export function SignUpForm() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [globalError, setGlobalError] = useState("");

	const handleEmailSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		setGlobalError("");
		setIsLoading(true);

		const result = signUpSchema.safeParse({
			name,
			email,
			password,
			confirmPassword,
		});
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			setErrors({
				name: fieldErrors.name?.[0],
				email: fieldErrors.email?.[0],
				password: fieldErrors.password?.[0],
				confirmPassword: fieldErrors.confirmPassword?.[0],
			});
			setIsLoading(false);
			return;
		}

		try {
			await authClient.signUp.email(
				{
					name,
					email,
					password,
					callbackURL: "/",
				},
				{
					onSuccess: () => {
						router.push("/");
					},
				},
			);
		} catch (error) {
			setGlobalError(error instanceof Error ? error.message : "Sign up failed");
			setIsLoading(false);
		}
	};

	const handleSocialSignIn = async (provider: "github" | "google") => {
		setIsLoading(true);
		setGlobalError("");

		try {
			await authClient.signIn.social(
				{
					provider,
				},
				{
					onSuccess: () => {
						router.push("/");
					},
				},
			);
		} catch (_error) {
			setGlobalError(`${provider} sign-in failed`);
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<form className="space-y-6" onSubmit={handleEmailSignUp}>
				{globalError && (
					<div className="rounded-md bg-destructive/10 p-4 text-destructive text-sm">
						{globalError}
					</div>
				)}

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Name</Label>
						<Input
							aria-describedby={errors.name ? "name-error" : undefined}
							aria-invalid={!!errors.name}
							className={errors.name ? "border-destructive" : ""}
							disabled={isLoading}
							id="name"
							onChange={(e) => setName(e.target.value)}
							placeholder="John Doe"
							type="text"
							value={name}
						/>
						{errors.name && (
							<p className="mt-1 text-destructive text-sm" id="name-error">
								{errors.name}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							aria-describedby={errors.email ? "email-error" : undefined}
							aria-invalid={!!errors.email}
							className={errors.email ? "border-destructive" : ""}
							disabled={isLoading}
							id="email"
							onChange={(e) => setEmail(e.target.value)}
							placeholder="you@example.com"
							type="email"
							value={email}
						/>
						{errors.email && (
							<p className="mt-1 text-destructive text-sm" id="email-error">
								{errors.email}
							</p>
						)}
					</div>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							aria-describedby={
								errors.password ? "password-error" : "password-hint"
							}
							aria-invalid={!!errors.password}
							className={errors.password ? "border-destructive" : ""}
							disabled={isLoading}
							id="password"
							onChange={(e) => setPassword(e.target.value)}
							type="password"
							value={password}
						/>
						{!errors.password && (
							<p className="text-muted-foreground text-xs" id="password-hint">
								Must be at least 8 characters
							</p>
						)}
						{errors.password && (
							<p className="mt-1 text-destructive text-sm" id="password-error">
								{errors.password}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input
							aria-describedby={
								errors.confirmPassword ? "confirm-password-error" : undefined
							}
							aria-invalid={!!errors.confirmPassword}
							className={errors.confirmPassword ? "border-destructive" : ""}
							disabled={isLoading}
							id="confirmPassword"
							onChange={(e) => setConfirmPassword(e.target.value)}
							type="password"
							value={confirmPassword}
						/>
						{errors.confirmPassword && (
							<p
								className="mt-1 text-destructive text-sm"
								id="confirm-password-error"
							>
								{errors.confirmPassword}
							</p>
						)}
					</div>
				</div>

				<Button className="w-full" disabled={isLoading} type="submit">
					{isLoading ? "Signing up..." : "Sign up with Email"}
				</Button>
			</form>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<Separator />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-card px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
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

			<div className="text-center text-sm">
				<span className="text-muted-foreground">Already have an account? </span>
				<Link
					className="font-medium text-primary hover:underline"
					href="/auth/signin"
				>
					Sign in
				</Link>
			</div>
		</div>
	);
}
