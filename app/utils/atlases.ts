import { InvalidOperationError } from "./api-handler";

export interface AtlasVersionNumbers {
  generation: number;
  revision: number;
}

/**
 * Parse generation and revision numbers from an atlas version as written in an S3 key.
 * @param s3Version - Atlas version from S3 key.
 * @returns object containing generation and revision.
 */
export function parseS3AtlasVersion(s3Version: string): AtlasVersionNumbers {
  const v = s3Version.trim();
  if (v.length === 0) {
    throw new InvalidOperationError("Invalid atlas version: empty");
  }

  // Integer major, no leading zeros
  if (/^[1-9]\d*$/.test(v))
    return {
      generation: Number(v),
      revision: 0,
    };

  // Major.minor, no leading zeros in either part except for minor version 0
  const match = /^([1-9]\d*)[-.](0|[1-9][0-9]*)$/.exec(v);
  if (match)
    return {
      generation: Number(match[1]),
      revision: Number(match[2]),
    };

  throw new InvalidOperationError(`Invalid atlas version: ${s3Version}`);
}
