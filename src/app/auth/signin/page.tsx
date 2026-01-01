import { SignInForm } from "@/components/auth/signin-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2">
					<CardTitle className="font-semibold text-2xl tracking-tight">
						Sign in
					</CardTitle>
					<CardDescription>
						Choose your preferred sign-in method
					</CardDescription>
				</CardHeader>
				<CardContent>
					<SignInForm />
				</CardContent>
			</Card>
		</main>
	);
}
