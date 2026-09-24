import { readJsonBody } from "@/app/common/utils";
import { UNREADABLE_CREATED_ATLAS_MESSAGE } from "./constants";
import { type CreatedAtlas } from "./entities";

/**
 * Returns true if the parsed 201 body identifies the created atlas.
 * @param body - Parsed response body.
 * @returns true if the body carries a non-empty string `id`.
 */
function isCreatedAtlas(body: unknown): body is CreatedAtlas {
  return (
    typeof body === "object" &&
    body !== null &&
    "id" in body &&
    typeof body.id === "string" &&
    body.id !== ""
  );
}

/**
 * Parses the created atlas from the create-revision endpoint's 201 body. A body
 * that isn't JSON, or that is JSON but doesn't identify the atlas (`null`, `{}`,
 * an empty body), rejects with a message saying the version was created, so the
 * request is reported as a failure rather than a silent success (#1550).
 * @param res - The 201 response.
 * @returns promise resolving to the created atlas.
 */
export async function parseCreatedAtlas(res: Response): Promise<CreatedAtlas> {
  let body: unknown;
  try {
    body = await readJsonBody(res);
  } catch {
    throw new Error(UNREADABLE_CREATED_ATLAS_MESSAGE);
  }
  if (!isCreatedAtlas(body)) throw new Error(UNREADABLE_CREATED_ATLAS_MESSAGE);
  return body;
}
