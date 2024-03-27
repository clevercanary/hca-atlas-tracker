import { ValidationError } from "yup";
import {
  NewUserData,
  newUserSchema,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { handler, method, query, role } from "../../../app/utils/api-handler";

/**
 * API route for creating a user. New user information is provided as a JSON body.
 */
export default handler(
  method("POST"),
  role("CONTENT_ADMIN"),
  async (req, res) => {
    let newInfo: NewUserData;
    try {
      newInfo = await newUserSchema.validate(req.body);
    } catch (e) {
      if (e instanceof ValidationError) {
        res.status(400).end();
        return;
      } else {
        throw e;
      }
    }
    await query(
      "INSERT INTO hat.users (disabled, email, full_name, role) VALUES ($1, $2, $3, $4)",
      [
        newInfo.disabled.toString(),
        newInfo.email,
        newInfo.full_name,
        newInfo.role,
      ]
    );
    res.status(201).end();
  }
);
