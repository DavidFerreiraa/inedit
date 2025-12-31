"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchModal } from "./search-modal";

export function SearchTrigger() {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<button
				className="flex items-center gap-2 rounded-md border border-border bg-input px-3 py-1.5 transition-colors hover:bg-accent"
				onClick={() => setOpen(true)}
				type="button"
			>
				<Search className="h-4 w-4 text-muted-foreground" />
				<span className="text-muted-foreground text-sm">Search...</span>
				<kbd className="hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-muted-foreground text-xs sm:inline-flex">
					⌘K
				</kbd>
			</button>
			<SearchModal onOpenChange={setOpen} open={open} />
		</>
	);
}
