import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

let database: ReturnType<typeof drizzle> | undefined;

export function getDatabase() {
  if (!database) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required to connect to the database");
    }

    const pool = new Pool({
      connectionString,
    });

    database = drizzle(pool);
  }

  return database;
}
