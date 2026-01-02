"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { GroupedInedits } from "@/server/actions/my-inedits";
import { IneditCard } from "./inedit-card";

interface BancaGroupProps {
	group: GroupedInedits;
}

export function BancaGroup({ group }: BancaGroupProps) {
	return (
		<Accordion
			className="w-full rounded-lg border bg-card"
			defaultValue={[group.bancaId]}
			type="multiple"
		>
			<AccordionItem value={group.bancaId}>
				<AccordionTrigger className="px-4 py-3 hover:no-underline">
					<div className="flex w-full items-center justify-between pr-4">
						<div className="flex-1 text-left">
							<h2 className="font-semibold text-lg">{group.bancaName}</h2>
							{group.bancaDescription && (
								<p className="text-muted-foreground text-sm">
									{group.bancaDescription}
								</p>
							)}
						</div>
						<Badge className="ml-4" variant="secondary">
							{group.questionCount}{" "}
							{group.questionCount === 1 ? "questão" : "questões"}
						</Badge>
					</div>
				</AccordionTrigger>
				<AccordionContent className="px-4 pb-4">
					<div className="space-y-3 pt-4">
						{group.questions.map((question) => (
							<IneditCard key={question.id} question={question} />
						))}
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
