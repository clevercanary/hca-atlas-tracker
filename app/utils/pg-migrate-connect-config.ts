import pg from "pg";

export function getPoolConfig(): pg.PoolConfig {
  if (process.env.APP_ENV === "aws-dev" || process.env.APP_ENV === "aws-prod") {
    const user =
      JSON.parse(process.env.PG_MIGRATE_USER || "{}")["username"] || "";
    const password =
      JSON.parse(process.env.PG_MIGRATE_USER || "{}")["password"] || "";

    // Production config with IAM authentication
    return {
      connectionTimeoutMillis: 5000,
      database: process.env.PGDATABASE || "",
      host: process.env.PGHOST || "",
      idleTimeoutMillis: 10000,
      password: password,
      port: 5432,
      ssl: true,
      user: user,
    };
  } else {
    // Development config for local database
    return {
      connectionTimeoutMillis: 5000,
      database: "atlas-tracker",
      host: "localhost",
      idleTimeoutMillis: 10000,
      password: "", // Local DB password
      port: 5432,
      ssl: false,
      user: "",
    };
  }
}
