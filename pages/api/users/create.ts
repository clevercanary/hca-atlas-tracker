import { ValidationError } from "yup";
import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import {
  NewUserData,
  newUserSchema,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbUserToApiUser } from "../../../app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "../../../app/common/entities";
import { createUser } from "../../../app/services/users";
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
    res.status(201).json(dbUserToApiUser(await createUser(newInfo)));
  }
);
