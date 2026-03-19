import { S3KeyFormatError } from "./files";

export interface AtlasVersionNumbers {
  generation: number;
  revision: number;
}

export interface AtlasNameAndVersion extends AtlasVersionNumbers {
  shortName: string;
}

/**
 * Parse short name, generation, and revision from an atlas name obtained from a URL.
 * @param urlName - Name with version as represented in a URL.
 * @returns object containing short name, generation, and revision.
 */
export function parseUrlAtlasName(urlName: string): AtlasNameAndVersion | null {
  const match = /^(.+)_v([1-9]\d*)\.(0|[1-9]\d*)$/.exec(urlName);
  if (match === null) return null;
  const [, shortName, generationString, revisionString] = match;
  return {
    generation: Number(generationString),
    revision: Number(revisionString),
    shortName,
  };
}

/**
 * Parse generation and revision numbers from an atlas version as written in an S3 key.
 * @param s3Version - Atlas version from S3 key.
 * @returns object containing generation and revision.
 */
export function parseS3AtlasVersion(s3Version: string): AtlasVersionNumbers {
  const v = s3Version.trim();
  if (v.length === 0) {
    throw new S3KeyFormatError("Invalid atlas version: empty");
  }

  // Integer major, no leading zeros
  if (/^[1-9]\d*$/.test(v))
    return {
      generation: Number(v),
      revision: 0,
    };

  // Major-minor, no leading zeros in either part except for minor version 0
  const match = /^([1-9]\d*)-(0|[1-9][0-9]*)$/.exec(v);
  if (match)
    return {
      generation: Number(match[1]),
      revision: Number(match[2]),
    };

  throw new S3KeyFormatError(`Invalid atlas version: ${s3Version}`);
}
