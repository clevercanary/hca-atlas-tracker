import { METHOD } from "../../../../../../app/common/entities";
import { startUpdateForEntrySheetValidation } from "../../../../../../app/services/entry-sheets";
import {
  handler,
  method,
  registeredUser,
} from "../../../../../../app/utils/api-handler";

/**
 * API route for triggering an update of an entry sheet validation.
 */
export default handler(
  method(METHOD.POST),
  registeredUser,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const entrySheetValidationId = req.query.entrySheetValidationId as string;
    await startUpdateForEntrySheetValidation(atlasId, entrySheetValidationId);
    res.status(202).end();
  },
);
