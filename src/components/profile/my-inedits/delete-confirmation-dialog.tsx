"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { IneditWithBanca } from "@/server/actions/my-inedits";

interface DeleteConfirmationDialogProps {
	question: IneditWithBanca;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmationDialog({
	question,
	open,
	onOpenChange,
}: DeleteConfirmationDialogProps) {
	const router = useRouter();
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);

		try {
			const response = await fetch(
				`/api/banca/${question.banca.id}/questions/${question.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete question");
			}

			// Close dialog and refresh page data
			onOpenChange(false);
			router.refresh();
		} catch (error) {
			console.error("Error deleting question:", error);
			setIsDeleting(false);
			// Keep dialog open on error
		}
	};

	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Deletar questão?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta ação não pode ser desfeita. A questão será permanentemente
						removida do sistema.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						disabled={isDeleting}
						onClick={handleDelete}
					>
						{isDeleting ? "Deletando..." : "Deletar"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
