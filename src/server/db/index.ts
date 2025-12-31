import * as schema from "./schema";
import { env } from "@/env";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const conn = neon(env.DATABASE_URL);

export const db = drizzle(conn, { schema });
