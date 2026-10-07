import { type HCAAtlasTrackerIssuedApiToken } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { readJsonBody } from "@/app/common/utils";
import { UNREADABLE_API_TOKEN_MESSAGE } from "./constants";

/**
 * Returns true if the parsed 201 body carries a token and its expiry.
 * @param body - Parsed response body.
 * @returns true if the body has non-empty string `token` and `expires`.
 */
function isIssuedApiToken(
  body: unknown,
): body is HCAAtlasTrackerIssuedApiToken {
  return (
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    typeof body.token === "string" &&
    body.token !== "" &&
    "expires" in body &&
    typeof body.expires === "string" &&
    body.expires !== ""
  );
}

/**
 * Parses the issued token from the issuing endpoint's 201 body, rejecting with
 * a message that says a token was created if the body can't be read, so the
 * request is reported as a failure rather than a silent success (#1550).
 * @param res - The 201 response.
 * @returns promise resolving to the issued token.
 */
export async function parseIssuedApiToken(
  res: Response,
): Promise<HCAAtlasTrackerIssuedApiToken> {
  let body: unknown;
  try {
    body = await readJsonBody(res);
  } catch {
    throw new Error(UNREADABLE_API_TOKEN_MESSAGE);
  }
  if (!isIssuedApiToken(body)) throw new Error(UNREADABLE_API_TOKEN_MESSAGE);
  return body;
}
