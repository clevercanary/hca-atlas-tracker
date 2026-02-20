import {
  FILE_TYPE,
  NetworkKey,
} from "../apis/catalog/hca-atlas-tracker/common/entities";
import { isNetworkKey } from "../apis/catalog/hca-atlas-tracker/common/utils";
import { AtlasVersionNumbers, parseS3AtlasVersion } from "../utils/atlases";
import { InvalidOperationError } from "./api-handler";

// Parsed S3 key path components
interface S3KeyPathComponents {
  atlasName: string; // e.g., 'gut-v1'
  filename: string; // e.g., 'file.h5ad'
  folderType: string; // e.g., 'source-datasets', 'integrated-objects', 'manifests'
  network: NetworkKey; // e.g., 'bio_network'
}

/**
 * Parses S3 key path into standardized components
 * @param s3Key - The S3 object key to parse
 * @returns Parsed components including network, atlas name, folder type, and filename
 * @throws InvalidS3KeyFormatError if the S3 key doesn't have at least 4 path segments
 * @example
 * parseS3KeyPath('bio_network/gut-v1/integrated-objects/file.h5ad')
 * // Returns: { network: 'bio_network', atlasName: 'gut-v1', folderType: 'integrated-objects', filename: 'file.h5ad' }
 */
export function parseS3KeyPath(s3Key: string): S3KeyPathComponents {
  const pathParts = s3Key.split("/");

  if (pathParts.length < 4) {
    throw new InvalidOperationError(
      `Invalid S3 key format: ${s3Key}. Expected format: bio_network/atlas-name/folder-type/filename`,
    );
  }

  const network = pathParts[0];

  if (!isNetworkKey(network)) {
    throw new InvalidOperationError(`Unknown bionetwork: ${network}`);
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
      throw new InvalidOperationError(
        `Unknown folder type: ${s3TypeFolder}. Expected: source-datasets, integrated-objects, or manifests`,
      );
  }
}

/**
 * Parses S3 atlas name into base name and version components
 * @param s3AtlasName - The atlas name from S3 path (e.g., 'gut-v1', 'retina-v1-1')
 * @returns Object containing the atlas base name and S3 version string
 * @throws Error if the atlas name doesn't match the expected format
 * @example
 * parseS3AtlasName('gut-v1') // Returns: { atlasBaseName: 'gut', s3Version: '1' }
 * parseS3AtlasName('retina-v1-1') // Returns: { atlasBaseName: 'retina', s3Version: '1-1' }
 */
function parseS3AtlasName(s3AtlasName: string): {
  atlasBaseName: string;
  s3Version: string;
} {
  // Match patterns like 'gut-v1' or 'gut-v1-1' (for v1.1)
  const versionMatch = s3AtlasName.match(/^(.+)-v(\d+(?:-\d+)*)$/);

  if (!versionMatch) {
    throw new Error(
      `Invalid S3 atlas name format: ${s3AtlasName}. Expected format: name-v1 or name-v1-1`,
    );
  }

  const [, atlasBaseName, s3Version] = versionMatch;
  return { atlasBaseName, s3Version };
}

/**
 * Get the file name from the given S3 key and insert the given version string, replacing any existing version information.
 * @param s3Key - S3 key to get file name from.
 * @param versionString - Version string to insert.
 * @returns file name with version information.
 */
export function insertVersionInFileNameFromS3Key(
  s3Key: string,
  versionString: string,
): string {
  return insertVersionInFileName(
    getFileBaseName(parseS3KeyPath(s3Key).filename),
    versionString,
  );
}

/**
 * Insert a version string into a file name.
 * @param baseFileName - Base file name, without version.
 * @param versionString - Version string to insert.
 * @returns file name with version information.
 */
function insertVersionInFileName(
  baseFileName: string,
  versionString: string,
): string {
  return baseFileName.replace(/(?=\..+$)/, versionString);
}

/**
 * Get a file's base name by stripping version information.
 * @param fileName - Actual file name.
 * @returns file name with version information stripped.
 */
export function getFileBaseName(fileName: string): string {
  return fileName.replace(/-r\d+(?:-wip-\d+)?(?=\..+$)/, "");
}

/**
 * Derive normalized atlas and file info from an S3 key.
 * @param s3Key - S3 key.
 * @returns normalized atlas and file info.
 */
export function parseNormalizedInfoFromS3Key(s3Key: string): {
  atlasNetwork: NetworkKey;
  atlasShortName: string;
  atlasVersion: AtlasVersionNumbers;
  fileBaseName: string;
  fileType: FILE_TYPE;
} {
  const { atlasName, filename, folderType, network } = parseS3KeyPath(s3Key);
  const { atlasBaseName, s3Version } = parseS3AtlasName(atlasName);

  return {
    atlasNetwork: network,
    atlasShortName: atlasBaseName.toLowerCase(),
    atlasVersion: parseS3AtlasVersion(s3Version),
    fileBaseName: getFileBaseName(filename),
    fileType: determineFileType(folderType),
  };
}
