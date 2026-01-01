"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient, type Session } from "@/server/better-auth/client";

interface UserDropdownProps {
	session: Session;
}

export function UserDropdown({ session }: UserDropdownProps) {
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();

	const handleSignOut = async () => {
		setIsLoading(true);
		try {
			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push("/auth/signin");
					},
				},
			});
		} catch (error) {
			console.error("Sign out failed:", error);
			setIsLoading(false);
		}
	};

	const initials = session.user.name
		? session.user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
		: (session.user.email?.[0]?.toUpperCase() ?? "U");

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
				<Avatar className="h-8 w-8">
					<AvatarImage
						alt={session.user.name ?? ""}
						src={session.user.image ?? undefined}
					/>
					<AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
						{initials}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel>
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm">{session.user.name ?? "User"}</p>
						<p className="text-muted-foreground text-xs">
							{session.user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem disabled={isLoading} onClick={handleSignOut}>
					<LogOut className="mr-2 h-4 w-4" />
					<span>{isLoading ? "Signing out..." : "Sign out"}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
