import { getSession } from "@/server/better-auth/server";
import { SearchTrigger } from "./search-trigger";
import { UserDropdown } from "./user-dropdown";

export async function AppHeader() {
	const session = await getSession();

	return (
		<header className="fixed top-0 z-50 w-full border-border/50 border-b bg-zinc-100/80 backdrop-blur-md">
			<div className="container flex h-14 items-center justify-between px-4 md:px-6">
				<div className="flex items-center gap-8">
					<h1 className="font-semibold text-base tracking-tight">Inedit</h1>
					<SearchTrigger />
				</div>
				{session && <UserDropdown session={session} />}
			</div>
		</header>
	);
}
