import { TEST_USERS } from "@/testing/constants";
import { type NextApiRequest } from "next";
import { type Session } from "next-auth";

export async function getServerSession(
  req: NextApiRequest,
): Promise<Session | null> {
  const authorization = req.headers.authorization;
  if (!authorization) return null;
  const token = /^Bearer (.+)$/.exec(authorization)?.[1];
  if (!token) return null;
  const user = TEST_USERS.find((u) => u.token === token);
  if (!user) throw new Error("Invalid token");
  return {
    expires: "",
    user: {
      email: user.email,
      name: user.name,
    },
  };
}
