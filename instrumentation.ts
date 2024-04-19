/**
 * Function to run on server start.
 */
export async function register(): Promise<void> {
  // Initialize HCA projects
  await import("./app/services/hca-projects");
}
