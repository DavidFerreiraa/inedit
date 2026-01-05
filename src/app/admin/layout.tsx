import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/constants/generation-limits";
import { getSession } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session?.user) {
		redirect("/auth/signin");
	}

	// Verify admin role
	const [userData] = await db
		.select({ role: user.role })
		.from(user)
		.where(eq(user.id, session.user.id));

	if (!userData || !isAdmin(userData.role)) {
		redirect("/"); // Redirect non-admins to home
	}

	return <>{children}</>;
}
