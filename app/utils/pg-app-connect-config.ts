import pg from "pg";

export function getPoolConfig(): pg.PoolConfig {
  if (process.env.APP_ENV === "aws-dev") {
    // Production config with IAM authentication
    return {
      connectionTimeoutMillis: 5000,
      database: process.env.PGDATABASE || "",
      host: process.env.PGHOST || "",
      idleTimeoutMillis: 10000,
      password: JSON.parse(process.env.PGPASSWORD || "")["PGPASSWORD"] || "",
      port: 5432,
      ssl: true,
      user: "hat_app",
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
