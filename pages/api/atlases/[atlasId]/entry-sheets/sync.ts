import { updateAtlasEntrySheetValidations } from "app/services/entry-sheets";
import { METHOD } from "../../../../../app/common/entities";
import {
  handler,
  method,
  registeredUser,
} from "../../../../../app/utils/api-handler";

/**
 * API route for triggering validation of an atlas's entry sheets.
 */
export default handler(
  method(METHOD.POST),
  registeredUser,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    updateAtlasEntrySheetValidations(atlasId);
    res.status(202).end();
  }
);
