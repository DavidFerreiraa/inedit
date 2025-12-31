import { SignUpForm } from "@/components/auth/signup-form";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function SignUpPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-zinc-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-2">
					<CardTitle className="font-semibold text-2xl tracking-tight">
						Sign up
					</CardTitle>
					<CardDescription>Create your account</CardDescription>
				</CardHeader>
				<CardContent>
					<SignUpForm />
				</CardContent>
			</Card>
		</main>
	);
}
