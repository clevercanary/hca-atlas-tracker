/**
 * Strips version suffix from a filename.
 *
 * Removes patterns like `-r1`, `-r2-wip-3` before the `.h5ad` extension.
 *
 * @param filename - The filename to process
 * @returns The base filename with version suffix removed
 *
 * @example
 * stripVersionSuffix('foo-r1.h5ad') // Returns: 'foo.h5ad'
 * stripVersionSuffix('foo-r1-wip-2.h5ad') // Returns: 'foo.h5ad'
 * stripVersionSuffix('foo-r2.h5ad') // Returns: 'foo.h5ad'
 * stripVersionSuffix('foo.h5ad') // Returns: 'foo.h5ad' (no suffix to strip)
 * stripVersionSuffix('bar-r3-wip-10.h5ad') // Returns: 'bar.h5ad'
 */
export function stripVersionSuffix(filename: string): string {
  // Pattern: -r\d+(-wip-\d+)? immediately before .h5ad extension
  // (?=\.h5ad$) is a positive lookahead that ensures .h5ad comes after the pattern
  return filename.replace(/-r\d+(-wip-\d+)?(?=\.h5ad$)/, "");
}
