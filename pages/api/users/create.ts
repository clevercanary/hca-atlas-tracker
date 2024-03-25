import { handler, method, query, role } from "../../../app/utils/api-handler";

export default handler(
  method("POST"),
  role("CONTENT_ADMIN"),
  async (req, res) => {
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
);
