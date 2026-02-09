import { InvalidOperationError } from "./api-handler";

/**
 * Parse atlas version string into generation and revision.
 * @param version - Normalized atlas version.
 * @returns atlas generation and revision.
 */
export function parseAtlasVersion(version: string): {
  generation: number;
  revision: number;
} {
  const match = /^(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Invalid atlas version: ${version}`);
  return {
    generation: Number(match[1]),
    revision: Number(match[2]),
  };
}

/**
 * Generate version variants for flexible matching.
 * @param version - Original version string.
 * @returns Array of version variants to match against.
 */
export function getVersionVariants(version: string): string[] {
  const versionWithoutDecimal = version.replace(".0", "");
  const versionWithDecimal = version.includes(".") ? version : `${version}.0`;

  // Return unique variants
  return [...new Set([version, versionWithoutDecimal, versionWithDecimal])];
}

/**
 * Normalize atlas version into a canonical form.
 * Accepts:
 *  - Integer major (e.g., "1") -> normalized to "1.0"
 *  - Major.minor (e.g., "1.2") -> kept as-is
 * Rejects any other formats.
 * @param version - Raw version string from path or input.
 * @returns canonical version string
 */
export function normalizeAtlasVersion(version: string): string {
  const v = version.trim();
  if (v.length === 0) {
    throw new InvalidOperationError("Invalid atlas version: empty");
  }

  // Integer major, no leading zeros
  if (/^[1-9]\d*$/.test(v)) return `${v}.0`;

  // Major.minor, no leading zeros in either part except for minor version 0
  if (/^[1-9]\d*\.(?:0|[1-9][0-9]*)$/.test(v)) return v;

  throw new InvalidOperationError(`Invalid atlas version: ${version}`);
}
