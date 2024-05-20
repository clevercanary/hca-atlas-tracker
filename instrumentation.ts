/**
 * Function to run on server start.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize HCA projects
    await import("./app/services/hca-projects");

    // Initialize CELLxGENE collections
    await import("./app/services/cellxgene");
  }
}
