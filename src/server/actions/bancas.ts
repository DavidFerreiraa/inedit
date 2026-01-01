"use server";

import { db } from "@/server/db";
import { bancas } from "@/server/db/schema";

export async function getBancas() {
	return await db.select().from(bancas);
}
