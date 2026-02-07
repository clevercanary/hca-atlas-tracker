/**
 * Strip version suffix from a filename.
 * Removes patterns like `-r1`, `-r2-wip-3` from `.h5ad` filenames.
 * @param filename - The filename to strip the version suffix from.
 * @returns The filename with any version suffix removed.
 * @example
 * stripVersionSuffix("foo-r1-wip-2.h5ad") // "foo.h5ad"
 * stripVersionSuffix("foo-r2.h5ad") // "foo.h5ad"
 * stripVersionSuffix("foo.h5ad") // "foo.h5ad"
 * stripVersionSuffix("foo.csv") // "foo.csv" (unchanged, not .h5ad)
 */
export function stripVersionSuffix(filename: string): string {
  return filename.replace(/-r\d+(-wip-\d+)?(?=\.h5ad$)/, "");
}

/**
 * Extract the generation number from an S3 atlas version string.
 * The generation is the first (major) number in the version.
 * @param s3Version - Version string from S3 path (e.g., "1", "1-1", "2-3")
 * @returns The generation number.
 * @example
 * extractGeneration("1") // 1
 * extractGeneration("1-1") // 1
 * extractGeneration("2-3") // 2
 */
export function extractGeneration(s3Version: string): number {
  const major = s3Version.split("-")[0];
  const generation = parseInt(major, 10);
  if (isNaN(generation)) {
    throw new Error(
      `Invalid S3 version format: ${s3Version}. Cannot extract generation.`,
    );
  }
  return generation;
}
