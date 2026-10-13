import postgres from "postgres";

function sanitizeConnectionString(raw: string): string {
  try {
    const url = new URL(raw);
    const schema = url.searchParams.get("schema");
    if (schema) {
      url.searchParams.delete("schema");
      if (!url.searchParams.has("options")) {
        url.searchParams.set("options", `-c search_path=${schema}`);
      }
    }
    return url.toString();
  } catch {
    return raw;
  }
}

const rawConnectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres123@localhost:5432/asset_management";

const connectionString = sanitizeConnectionString(rawConnectionString);

const globalForDb = globalThis as unknown as {
  sql: postgres.Sql | undefined;
};

export const sql = globalForDb.sql ?? postgres(connectionString);

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

export default sql;
