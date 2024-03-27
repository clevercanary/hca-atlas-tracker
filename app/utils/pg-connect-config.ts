import pg from "pg";

import { Signer } from "@aws-sdk/rds-signer";

// Function to generate AWS RDS IAM authentication token
const generateAuthToken = async (): Promise<string> => {
  const signer = new Signer({
    /**
     * Required. The hostname of the database to connect to.
     */
    hostname:
      "hca-atlas-tracker.cluster-cpaohu0f2w38.us-east-1.rds.amazonaws.com",
    /**
     * Required. The port number the database is listening on.
     */
    port: 5432,
    /**
     * Required. The username to login as.
     */
    username: "hca_atlas_tracker",
  });

  // Use this token as the password for connecting to your RDS instance
  return await signer.getAuthToken();
};

export function getPoolConfig(): pg.PoolConfig {
  console.log("NODE_ENV: ", process.env.NODE_ENV);
  console.log("APP_ENV: ", process.env.APP_ENV);

  if (process.env.APP_ENV === "aws-dev") {
    // Production config with IAM authentication
    return {
      connectionTimeoutMillis: 5,
      database: "hcaatlastracker",
      host: " hca-atlas-tracker.cluster-cpaohu0f2w38.us-east-1.rds.amazonaws.com",
      idleTimeoutMillis: 10000,
      password: generateAuthToken, // IAM auth token for production
      port: 5432,
      ssl: true,
      user: "hca_atlas_tracker",
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
