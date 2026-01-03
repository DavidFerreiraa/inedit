import { AlertCircle } from "lucide-react";

export function PreviewBanner() {
	return (
		<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
			<div className="flex items-center gap-2">
				<AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
				<div>
					<p className="font-medium text-amber-900 dark:text-amber-100">
						Modo Preview
					</p>
					<p className="text-amber-700 text-sm dark:text-amber-300">
						Estas questões ainda não foram salvas. Revise e salve-as abaixo.
					</p>
				</div>
			</div>
		</div>
	);
}
