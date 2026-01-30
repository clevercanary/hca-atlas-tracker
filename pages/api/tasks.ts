import { dbValidationToApiValidation } from "../../app/apis/catalog/hca-atlas-tracker/common/backend-utils";
import { ROLE_GROUP } from "../../app/apis/catalog/hca-atlas-tracker/common/constants";
import { METHOD } from "../../app/common/entities";
import { getValidationRecords } from "../../app/services/validations";
import { handler, method, role } from "../../app/utils/api-handler";

export default handler(
  method(METHOD.GET),
  role(ROLE_GROUP.READ),
  async (req, res) => {
    res.json((await getValidationRecords()).map(dbValidationToApiValidation));
  },
);
