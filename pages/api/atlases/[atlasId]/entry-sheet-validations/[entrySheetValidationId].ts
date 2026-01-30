import { dbEntrySheetValidationToApiModel } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { METHOD } from "../../../../../app/common/entities";
import { getEntrySheetValidation } from "../../../../../app/services/entry-sheets";
import {
  handler,
  method,
  registeredUser,
} from "../../../../../app/utils/api-handler";

/**
 * API route to get an entry sheet validations.
 */
export default handler(method(METHOD.GET), registeredUser, async (req, res) => {
  const atlasId = req.query.atlasId as string;
  const entrySheetValidationId = req.query.entrySheetValidationId as string;
  res
    .status(200)
    .json(
      dbEntrySheetValidationToApiModel(
        await getEntrySheetValidation(atlasId, entrySheetValidationId),
      ),
    );
});
