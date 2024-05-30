import { ROLE } from "app/apis/catalog/hca-atlas-tracker/common/entities";
import { taskCompletionDatesSchema } from "app/apis/catalog/hca-atlas-tracker/common/schema";
import { dbValidationToApiValidation } from "app/apis/catalog/hca-atlas-tracker/common/utils";
import { METHOD } from "app/common/entities";
import { updateTargetCompletions } from "app/services/validations";
import { handler, method, role } from "app/utils/api-handler";

export default handler(
  method(METHOD.PATCH),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    const { targetCompletion, taskIds } =
      await taskCompletionDatesSchema.validate(req.body);
    const updatedValidations = await updateTargetCompletions(
      targetCompletion === null ? null : new Date(targetCompletion),
      taskIds
    );
    res.json(updatedValidations.map(dbValidationToApiValidation));
  }
);
