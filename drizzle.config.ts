import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./src/lib/drizzle",
  dialect: "postgresql",
  dbCredentials: {
    database: "coscience_os_dev",
    user: "coscience_os",
    password: "coscience_os_dev_password",
    host: "192.168.3.12",
    ssl: false,
    port: 5433,
    url: process.env.DATABASE_URL,
  },
});
