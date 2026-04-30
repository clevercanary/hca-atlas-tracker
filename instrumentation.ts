/**
 * Function to run on server start.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Initialize HCA projects
    const { refreshProjectsIfNeeded } =
      await import("./app/services/hca-projects");
    refreshProjectsIfNeeded();

    // Initialize CELLxGENE collections
    const { refreshCellxGeneIfNeeded } =
      await import("./app/services/cellxgene");
    refreshCellxGeneIfNeeded();
  }
}
