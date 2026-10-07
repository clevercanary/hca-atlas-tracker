import { TEST_USERS } from "@/testing/constants";
import { TEST_SESSION_COOKIE_NAME } from "@/testing/utils";
import { type NextApiRequest } from "next";
import { type Session } from "next-auth";

export async function getServerSession(
  req: NextApiRequest,
): Promise<Session | null> {
  const sessionId = getCookie(req, TEST_SESSION_COOKIE_NAME);
  if (!sessionId) return null;
  const user = TEST_USERS.find((u) => u.sessionId === sessionId);
  if (!user) throw new Error("Invalid session");
  return {
    expires: "",
    user: {
      email: user.email,
      name: user.name,
    },
  };
}

/**
 * Read a cookie from the request's `Cookie` header.
 * @param req - Next API request.
 * @param name - Cookie name.
 * @returns cookie value, or undefined if absent.
 */
function getCookie(req: NextApiRequest, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return;
  for (const pair of cookieHeader.split(";")) {
    const [key, ...valueParts] = pair.trim().split("=");
    if (key === name) return valueParts.join("=");
  }
}
