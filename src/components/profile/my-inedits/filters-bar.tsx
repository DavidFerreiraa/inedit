"use client";

import { Filter, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface FiltersBarProps {
	searchQuery: string;
	selectedTags: string[];
	allTags: string[];
	onSearchChange: (value: string) => void;
	onTagsChange: (tags: string[]) => void;
	onClearFilters: () => void;
	hasActiveFilters: boolean;
}

export function FiltersBar({
	searchQuery,
	selectedTags,
	allTags,
	onSearchChange,
	onTagsChange,
	onClearFilters,
	hasActiveFilters,
}: FiltersBarProps) {
	const toggleTag = (tag: string) => {
		if (selectedTags.includes(tag)) {
			onTagsChange(selectedTags.filter((t) => t !== tag));
		} else {
			onTagsChange([...selectedTags, tag]);
		}
	};

	const removeTag = (tag: string) => {
		onTagsChange(selectedTags.filter((t) => t !== tag));
	};

	return (
		<div className="space-y-3">
			{/* Search and Filter Row */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
				{/* Search Input */}
				<div className="relative flex-1">
					<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						className="pl-9"
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder="Buscar por título..."
						type="text"
						value={searchQuery}
					/>
				</div>

				{/* Tag Filter Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button className="gap-2" variant="outline">
							<Filter className="h-4 w-4" />
							<span className="hidden sm:inline">Tags</span>
							{selectedTags.length > 0 && (
								<Badge className="ml-1" variant="secondary">
									{selectedTags.length}
								</Badge>
							)}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-56 bg-zinc-100 dark:bg-zinc-900"
					>
						<DropdownMenuLabel>Filtrar por tags</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{selectedTags.length > 0 && (
							<>
								<DropdownMenuCheckboxItem
									checked={false}
									onCheckedChange={() => onTagsChange([])}
								>
									Limpar seleção
								</DropdownMenuCheckboxItem>
								<DropdownMenuSeparator />
							</>
						)}
						{allTags.length === 0 ? (
							<div className="px-2 py-3 text-center text-muted-foreground text-sm">
								Nenhuma tag disponível
							</div>
						) : (
							allTags.map((tag) => (
								<DropdownMenuCheckboxItem
									checked={selectedTags.includes(tag)}
									key={tag}
									onCheckedChange={() => toggleTag(tag)}
								>
									{tag}
								</DropdownMenuCheckboxItem>
							))
						)}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Clear All Button */}
				{hasActiveFilters && (
					<Button
						className="gap-2"
						onClick={onClearFilters}
						size="sm"
						variant="ghost"
					>
						<X className="h-4 w-4" />
						<span className="hidden sm:inline">Limpar</span>
					</Button>
				)}
			</div>

			{/* Active Filters Display */}
			{selectedTags.length > 0 && (
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-muted-foreground text-sm">Filtrando por:</span>
					{selectedTags.map((tag) => (
						<Badge className="gap-1" key={tag} variant="secondary">
							{tag}
							<button
								className="ml-1 rounded-full hover:bg-secondary-foreground/20"
								onClick={() => removeTag(tag)}
								type="button"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					))}
				</div>
			)}
		</div>
	);
}
