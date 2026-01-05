import { eq } from "drizzle-orm";
import { BadgeInfo, Stars } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ProBadge } from "@/components/ui/pro-badge";
import type { UserRole } from "@/lib/constants/generation-limits";
import { getSession } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { SearchTrigger } from "./search-trigger";
import { ThemeToggle } from "./theme-toggle";
import { UserDropdown } from "./user-dropdown";

export async function AppHeader() {
	const session = await getSession();

	// Fetch user role if session exists
	let userRole: UserRole | undefined;
	if (session?.user?.id) {
		const [userData] = await db
			.select({ role: user.role })
			.from(user)
			.where(eq(user.id, session.user.id));
		userRole = (userData?.role ?? "free") as UserRole;
	}

	return (
		<header className="fixed top-0 z-50 w-full border-border/50 border-b bg-background/80 backdrop-blur-md">
			<div className="relative flex h-14 items-center justify-between px-4 md:px-6">
				<div className="flex items-center gap-8">
					<Link href="/">
						<h1 className="font-semibold text-base tracking-tight">Inedit</h1>
					</Link>
					<SearchTrigger />
				</div>
				<div className="flex items-center gap-2">
					{session && userRole === "admin" && (
						<Badge className="px-1.5 py-0.5 text-[10px]" variant="admin">
							Admin{" "}
							<Stars className="ml-1 inline-block h-3 w-3 text-yellow-400" />
						</Badge>
					)}
					{session && userRole === "pro" && <ProBadge />}
					{session && userRole === "free" && (
						<Badge className="px-1.5 py-0.5 text-[10px]" variant="free">
							Free{" "}
							<BadgeInfo className="ml-1 inline-block h-3 w-3 text-gray-400" />
						</Badge>
					)}
					<ThemeToggle />
					{session && <UserDropdown session={session} userRole={userRole} />}
				</div>
			</div>
		</header>
	);
}
