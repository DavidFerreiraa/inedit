"use client";

import { Eye, MoreVertical, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IneditWithBanca } from "@/server/actions/my-inedits";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

interface IneditActionsMenuProps {
	question: IneditWithBanca;
}

export function IneditActionsMenu({ question }: IneditActionsMenuProps) {
	const router = useRouter();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const handleView = () => {
		router.push(`/banca/${question.banca.id}?questionId=${question.id}`);
	};

	const handleAnswerAgain = () => {
		router.push(`/banca/${question.banca.id}?questionId=${question.id}`);
	};

	const handleEdit = () => {
		// Future: Navigate to edit page
		// router.push(`/profile/my-inedits/${question.id}/edit`);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button className="h-8 w-8" size="icon" variant="ghost">
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">Abrir menu de ações</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-48 bg-zinc-100 dark:bg-zinc-900"
				>
					<DropdownMenuItem onClick={handleView}>
						<Eye className="mr-2 h-4 w-4" />
						<span>Visualizar</span>
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleAnswerAgain}>
						<RotateCcw className="mr-2 h-4 w-4" />
						<span>Responder novamente</span>
					</DropdownMenuItem>
					<DropdownMenuItem disabled onClick={handleEdit}>
						<Pencil className="mr-2 h-4 w-4" />
						<span>Editar</span>
						<span className="ml-auto text-muted-foreground text-xs">
							Em breve
						</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={() => setIsDeleteDialogOpen(true)}
					>
						<Trash2 className="mr-2 h-4 w-4" />
						<span>Deletar</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<DeleteConfirmationDialog
				onOpenChange={setIsDeleteDialogOpen}
				open={isDeleteDialogOpen}
				question={question}
			/>
		</>
	);
}
