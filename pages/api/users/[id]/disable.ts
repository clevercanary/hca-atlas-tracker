import {
  handler,
  handleRequiredParam,
  method,
  query,
  role,
} from "../../../../app/utils/api-handler";

export default handler(
  method("POST"),
  role("CONTENT_ADMIN"),
  async (req, res) => {
    const id = handleRequiredParam(req, res, "id", /^\d+$/);
    if (id === null) return;
    const queryResult = await query(
      "UPDATE hat.users SET disabled=true WHERE id=$1",
      [id]
    );
    if (queryResult.rowCount === 0) {
      res.status(404).end();
      return;
    }
    res.status(200).end();
  }
);
