import { FILE_VALIDATOR_NAMES } from "../apis/catalog/hca-atlas-tracker/common/constants";
import {
  DBFileValidationSummary,
  FILE_TYPE,
  FileValidationSummary,
  NetworkKey,
  ValidatorSummaryStatus,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { isNetworkKey } from "../apis/catalog/hca-atlas-tracker/common/utils";
import {
  AtlasSlugNameAndVersion,
  AtlasVersionNumbers,
  parseS3AtlasVersion,
} from "../utils/atlases";

// Parsed S3 key path components
interface S3KeyPathComponents {
  atlasName: string; // e.g., 'gut-v1'
  filename: string; // e.g., 'file.h5ad'
  folderType: string; // e.g., 'source-datasets', 'integrated-objects', 'manifests'
  network: NetworkKey; // e.g., 'bio_network'
}

export class S3KeyFormatError extends Error {
  name = "S3KeyFormatError";
}

const EXTENSION_REGEX = /\.[^.]+$/;
const BEFORE_EXTENSION_REGEX = /(?=\.[^.]+$)/;
const VERSION_SUFFIX_REGEX =
  /(?:-r\d+(?:-wip-\d+)?(?:-edit-.+)?|-edit-.+)(?=\.[^.]+$)/;

/**
 * Parses S3 key path into standardized components
 * @param s3Key - The S3 object key to parse
 * @returns Parsed components including network, atlas name, folder type, and filename
 * @throws S3KeyFormatError if the S3 key doesn't have at least 4 path segments
 * @example
 * parseS3KeyPath('bio_network/gut-v1/integrated-objects/file.h5ad')
 * // Returns: { network: 'bio_network', atlasName: 'gut-v1', folderType: 'integrated-objects', filename: 'file.h5ad' }
 */
export function parseS3KeyPath(s3Key: string): S3KeyPathComponents {
  const pathParts = s3Key.split("/");

  if (pathParts.length < 4) {
    throw new S3KeyFormatError(
      `Invalid S3 key format: ${s3Key}. Expected format: bio_network/atlas-name/folder-type/filename`,
    );
  }

  const network = pathParts[0];

  if (!isNetworkKey(network)) {
    throw new S3KeyFormatError(`Unknown bionetwork: ${network}`);
  }

  return {
    atlasName: pathParts[1],
    filename: pathParts[pathParts.length - 1], // Last segment
    folderType: pathParts[pathParts.length - 2], // Second to last segment
    network,
  };
}

/**
 * Determines the file type based on the S3 key folder structure
 * @param s3TypeFolder - The S3 folder name indicating the file type
 * @returns The file type: 'source_dataset', 'integrated_object', or 'ingest_manifest'
 * @throws UnknownFolderTypeError if the folder type is not recognized
 */
function determineFileType(s3TypeFolder: string): FILE_TYPE {
  switch (s3TypeFolder) {
    case "source-datasets":
      return FILE_TYPE.SOURCE_DATASET;
    case "integrated-objects":
      return FILE_TYPE.INTEGRATED_OBJECT;
    case "manifests":
      return FILE_TYPE.INGEST_MANIFEST;
    default:
      throw new S3KeyFormatError(
        `Unknown folder type: ${s3TypeFolder}. Expected: source-datasets, integrated-objects, or manifests`,
      );
  }
}

/**
 * Parses S3 atlas name into short name slug, generation, and revision
 * @param s3AtlasName - The atlas name from S3 path (e.g., 'gut-v1', 'retina-v1-1')
 * @returns Object containing the short name slug, the generation number, and the revision number
 * @throws Error if the atlas name doesn't match the expected format
 * @example
 * parseS3AtlasName('gut-v1') // Returns: { shortNameSlug: 'gut', generation: 1, revision: 0 }
 * parseS3AtlasName('retina-v1-1') // Returns: { shortNameSlug: 'retina', generation: 1, revision: 1 }
 */
function parseS3AtlasName(s3AtlasName: string): AtlasSlugNameAndVersion {
  // Match patterns like 'gut-v1' or 'gut-v1-1' (for v1.1)
  const versionMatch = s3AtlasName.match(/^(.+)-v(\d+(?:-\d+)*)$/);

  if (!versionMatch) {
    throw new S3KeyFormatError(
      `Invalid S3 atlas name format: ${s3AtlasName}. Expected format: name-v1 or name-v1-1`,
    );
  }

  const [, shortNameSlug, s3Version] = versionMatch;
  return { shortNameSlug, ...parseS3AtlasVersion(s3Version) };
}

/**
 * Insert a version string into a filename.
 * @param baseFilename - Base filename, without version.
 * @param versionString - Version string to insert.
 * @returns filename with version information.
 */
export function insertVersionInFilename(
  baseFilename: string,
  versionString: string,
): string {
  return baseFilename.replace(BEFORE_EXTENSION_REGEX, "-" + versionString);
}

/**
 * Get a file's base name by stripping version and edit suffixes.
 * @param filename - Actual filename.
 * @returns filename with version and edit suffixes stripped.
 */
export function getFileBaseName(filename: string): string {
  return filename.replace(VERSION_SUFFIX_REGEX, "");
}

/**
 * Drop the extension from a filename.
 * @param filename - Filename to remove extension from.
 * @returns filename without extension.
 */
export function removeFileExtension(filename: string): string {
  return filename.replace(EXTENSION_REGEX, "");
}

/**
 * Get the extension, including separating dot, from a filename, returning empty string if none is found.
 * @param filename - Filename to get extension from.
 * @returns extension.
 */
export function getFileExtension(filename: string): string {
  const match = EXTENSION_REGEX.exec(filename);
  return match?.[0] ?? "";
}

/**
 * Derive normalized atlas and file info from an S3 key.
 * @param s3Key - S3 key.
 * @returns normalized atlas and file info.
 */
export function parseNormalizedInfoFromS3Key(s3Key: string): {
  atlasNetwork: NetworkKey;
  atlasShortNameSlug: string;
  atlasVersion: AtlasVersionNumbers;
  fileBaseName: string;
  fileType: FILE_TYPE;
} {
  const { atlasName, filename, folderType, network } = parseS3KeyPath(s3Key);
  const { shortNameSlug, ...atlasVersion } = parseS3AtlasName(atlasName);

  return {
    atlasNetwork: network,
    atlasShortNameSlug: shortNameSlug.toLowerCase(),
    atlasVersion,
    fileBaseName: getFileBaseName(filename),
    fileType: determineFileType(folderType),
  };
}

/**
 * Normalize a file validation summary, lifting any legacy boolean validator entries to the current object shape.
 * @param summary - Raw validation summary from the database, or null.
 * @returns Validation summary in the current shape, or null.
 */
export function normalizeValidationSummary(
  summary: DBFileValidationSummary | null,
): FileValidationSummary | null {
  if (summary === null) return null;
  const validators: FileValidationSummary["validators"] = {};
  for (const name of FILE_VALIDATOR_NAMES) {
    const value = summary.validators[name];
    if (value === undefined) continue;
    validators[name] = normalizeValidator(value);
  }
  return {
    overallValid: summary.overallValid,
    validators,
  };
}

/**
 * Normalize a single validator summary entry, mapping legacy boolean values to the current object shape.
 * Legacy rows stored a bare boolean per validator with no error or warning counts available, so counts are zeroed.
 * @param value - Raw validator entry from the database.
 * @returns Normalized validator summary status.
 */
function normalizeValidator(
  value: boolean | ValidatorSummaryStatus,
): ValidatorSummaryStatus {
  if (typeof value === "boolean") {
    return {
      errorCount: 0,
      valid: value,
      warningCount: 0,
    };
  }
  return value;
}
