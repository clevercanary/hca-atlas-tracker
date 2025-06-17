import { dbEntrySheetValidationToApiListModel } from "app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { METHOD } from "../../../../app/common/entities";
import { getAtlasEntrySheetValidations } from "../../../../app/services/entry-sheets";
import {
  handler,
  method,
  registeredUser,
} from "../../../../app/utils/api-handler";

/**
 * API route to get entry sheet validations of an atlas.
 */
export default handler(method(METHOD.GET), registeredUser, async (req, res) => {
  const atlasId = req.query.atlasId as string;
  res
    .status(200)
    .json(
      (await getAtlasEntrySheetValidations(atlasId)).map(
        dbEntrySheetValidationToApiListModel
      )
    );
});
