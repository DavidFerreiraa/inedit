"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProBadge } from "@/components/ui/pro-badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserRole } from "@/lib/constants/generation-limits";

interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	createdAt: string;
}

export function AdminUsersClient() {
	const queryClient = useQueryClient();

	const { data: users, isLoading } = useQuery<User[]>({
		queryKey: ["admin", "users"],
		queryFn: async () => {
			const res = await fetch("/api/admin/users");
			if (!res.ok) throw new Error("Failed to fetch users");
			return res.json();
		},
	});

	const updateRoleMutation = useMutation({
		mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
			const res = await fetch(`/api/admin/users/${userId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ role }),
			});
			if (!res.ok) {
				const error = await res.json();
				throw new Error(error.error || "Failed to update role");
			}
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
		},
		onError: (error) => {
			alert(
				error instanceof Error ? error.message : "Failed to update user role",
			);
		},
	});

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<Skeleton className="h-20 w-full" key={i} />
				))}
			</div>
		);
	}

	if (!users || users.length === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground">
				Nenhum usuário encontrado.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{users.map((userItem) => (
				<Card className="p-4" key={userItem.id}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div>
								<div className="flex items-center gap-2">
									<p className="font-medium">{userItem.name}</p>
									{userItem.role === "pro" && <ProBadge />}
									{userItem.role === "admin" && (
										<Badge variant="destructive">Admin</Badge>
									)}
								</div>
								<p className="text-muted-foreground text-sm">
									{userItem.email}
								</p>
							</div>
						</div>
						<Select
							disabled={updateRoleMutation.isPending}
							onValueChange={(role) =>
								updateRoleMutation.mutate({ userId: userItem.id, role })
							}
							value={userItem.role}
						>
							<SelectTrigger className="w-32">
								{updateRoleMutation.isPending &&
								updateRoleMutation.variables?.userId === userItem.id ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<SelectValue />
								)}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="free">Free</SelectItem>
								<SelectItem value="pro">PRO</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</Card>
			))}
		</div>
	);
}
