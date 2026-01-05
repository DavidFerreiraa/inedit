import { AppHeader } from "@/components/header";
import { AdminUsersClient } from "./page-client";

export default function AdminUsersPage() {
	return (
		<>
			<AppHeader />
			<main className="container mx-auto px-4 py-20">
				<h1 className="mb-8 font-bold text-3xl">Gerenciar Usuários</h1>
				<AdminUsersClient />
			</main>
		</>
	);
}
