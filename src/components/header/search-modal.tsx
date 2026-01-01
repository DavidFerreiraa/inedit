"use client";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SearchModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent className="max-w-2xl overflow-hidden p-0">
				<DialogTitle className="hidden">Search</DialogTitle>
				<Command className="rounded-lg border-0">
					<CommandInput placeholder="Search..." />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup heading="Suggestions">
							<CommandItem>Dashboard</CommandItem>
							<CommandItem>Settings</CommandItem>
						</CommandGroup>
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}
