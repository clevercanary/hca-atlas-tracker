import { type InvalidateQueryKeys } from "@/app/common/entities";

/**
 * Whether the value is an `InvalidateQueryKeys` object: an object whose
 * `awaited` and `dispatched` members, when present, are arrays. The keys
 * themselves are `readonly unknown[]`, so there is nothing further to check.
 * @param value - Value to test.
 * @returns true if the value has the `InvalidateQueryKeys` shape.
 */
function isInvalidateQueryKeys(value: unknown): value is InvalidateQueryKeys {
  if (typeof value !== "object" || value === null) return false;
  return ["awaited", "dispatched"].every((member) => {
    if (!(member in value)) return true;
    const list: unknown = value[member as keyof typeof value];
    return list === undefined || Array.isArray(list);
  });
}

/**
 * Parses an `InvalidateQueryKeys` value back out of its `hashKey([value])`
 * hash. `hashKey` is `JSON.stringify` with sorted object keys, so the hash is
 * JSON and the round trip is lossless for query keys, which are plain data.
 *
 * Parsed rather than captured so `useDeleteData` can memoize on the hash alone:
 * capturing the original object would need a dependency the exhaustive-deps
 * lint rightly forbids, and a ref written during render is forbidden too.
 * @param hash - Hash of a one-element array holding the value, or `undefined`.
 * @returns the value, or `undefined` when none was hashed or the shape is
 * unrecognised.
 */
export function parseInvalidateQueryKeys(
  hash: string,
): InvalidateQueryKeys | undefined {
  const parsed: unknown = JSON.parse(hash);
  if (!Array.isArray(parsed)) return undefined;
  const [value] = parsed as unknown[];
  return isInvalidateQueryKeys(value) ? value : undefined;
}
