import { NextApiRequest, NextApiResponse } from "next";
import { getUserRoleFromAuthorization, query } from "../../../app/utils/user";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).setHeader("Allow", "POST").end();
    return;
  }
  const role = await getUserRoleFromAuthorization(req.headers.authorization);
  if (role !== "CONTENT_ADMIN") {
    res.status(role === null ? 401 : 403).end();
    return;
  }
  const {
    disabled: newDisabled,
    email: newEmail,
    full_name: newFullName,
    role: newRole,
  } = req.query;
  if (
    !(
      typeof newDisabled === "string" &&
      (newDisabled === "true" || newDisabled === "false") &&
      typeof newEmail === "string" &&
      typeof newFullName === "string" &&
      typeof newRole === "string"
    )
  ) {
    res.status(400).end();
    return;
  }
  await query(
    "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
    [newDisabled, newEmail, newFullName, newRole]
  );
  res.status(201).end();
}
