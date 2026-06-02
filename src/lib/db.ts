import { env } from "bun";
import { drizzle } from "drizzle-orm/node-postgres";

if (!env || !env.DATABASE_URL) {
  throw new Error("Environment not loaded or env vars not available");
}

export const drib = drizzle(env.DATABASE_URL);
