"use client";

import { ChevronDown, FileText, FileUp, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SourceType = "upload" | "url" | "text";

interface SourceSelectorDropdownProps {
	value: SourceType;
	onValueChange: (value: SourceType) => void;
}

const SOURCE_OPTIONS = [
	{ value: "upload" as const, label: "Upload", icon: FileUp },
	{ value: "url" as const, label: "URL", icon: LinkIcon },
	{ value: "text" as const, label: "Text", icon: FileText },
] as const;

export function SourceSelectorDropdown({
	value,
	onValueChange,
}: SourceSelectorDropdownProps) {
	const currentOption = SOURCE_OPTIONS.find((opt) => opt.value === value);
	const Icon = currentOption?.icon ?? FileUp;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="w-full justify-between" size="sm" variant="outline">
					<span className="flex items-center gap-2">
						<Icon className="h-4 w-4" />
						{currentOption?.label ?? "Select"}
					</span>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[--radix-dropdown-menu-trigger-width]"
			>
				<DropdownMenuRadioGroup
					onValueChange={(newValue) => onValueChange(newValue as SourceType)}
					value={value}
				>
					{SOURCE_OPTIONS.map(
						({ value: optValue, label, icon: OptionIcon }) => (
							<DropdownMenuRadioItem key={optValue} value={optValue}>
								<OptionIcon className="mr-2 h-4 w-4" />
								{label}
							</DropdownMenuRadioItem>
						),
					)}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
