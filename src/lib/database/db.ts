"server-only";

import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env || !process.env.DATABASE_URL) {
  throw new Error("Environment not loaded or env vars not available");
}

export const drib = drizzle(process.env.DATABASE_URL);
