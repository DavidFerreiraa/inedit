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
import { Button } from "@/components/ui/button";

interface PreviewActionsProps {
	onSave: () => void;
	onDiscard: () => void;
	isLoading?: boolean;
}

export function PreviewActions({
	onSave,
	onDiscard,
	isLoading,
}: PreviewActionsProps) {
	const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

	return (
		<>
			<div className="flex gap-3 border-t pt-4">
				<Button
					className="flex-1"
					disabled={isLoading}
					variant="outline"
					onClick={onSave}
				>
					{isLoading ? "Salvando..." : "Salvar Questões"}
				</Button>
				<Button
					disabled={isLoading}
					onClick={() => setShowDiscardConfirm(true)}
					variant="outline"
				>
					Descartar
				</Button>
			</div>

			<AlertDialog
				onOpenChange={setShowDiscardConfirm}
				open={showDiscardConfirm}
			>
				<AlertDialogContent className="bg-zinc-100 dark:bg-zinc-900">
					<AlertDialogHeader>
						<AlertDialogTitle>Descartar questões?</AlertDialogTitle>
						<AlertDialogDescription>
							Isto irá excluir permanentemente estas questões de preview.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={onDiscard}>Descartar</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
