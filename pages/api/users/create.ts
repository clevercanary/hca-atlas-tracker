import { ValidationError } from "yup";
import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewUserData,
  newUserSchema,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../app/common/entities";
import { query } from "../../../app/services/database";
import { handler, method, role } from "../../../app/utils/api-handler";

/**
 * API route for creating a user. New user information is provided as a JSON body.
 */
export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
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
      "INSERT INTO hat.users (disabled, email, full_name, role, role_associated_resource_ids) VALUES ($1, $2, $3, $4, $5)",
      [
        newInfo.disabled.toString(),
        newInfo.email,
        newInfo.fullName,
        newInfo.role,
        newInfo.roleAssociatedResourceIds,
      ]
    );
    res.status(201).end();
  }
);
