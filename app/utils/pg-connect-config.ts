import pg from "pg";

import { Signer } from "@aws-sdk/rds-signer";

// Function to generate AWS RDS IAM authentication token
const generateAuthToken = async (): Promise<string> => {
  const signer = new Signer({
    hostname:
      "hca-atlas-tracker.cluster-cpaohu0f2w38.us-east-1.rds.amazonaws.com",
    port: 5432,
    region: "us-east-1",
    username: "hca_atlas_tracker",
  });

  // Use this token as the password for connecting to your RDS instance
  try {
    return await signer.getAuthToken();
  } catch (error) {
    console.error("Error generating authentication token:", error);
    throw error;
  }
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
