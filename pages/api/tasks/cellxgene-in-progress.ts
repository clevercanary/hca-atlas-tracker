import {
  ROLE,
  TASK_STATUS,
  VALIDATION_ID,
} from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { taskCellxGeneInProgressSchema } from "../../../app/apis/catalog/hca-atlas-tracker/common/schema";
import { METHOD } from "../../../app/common/entities";
import { updateSourceStudyTaskStatusesByDois } from "../../../app/services/validations";
import { handler, method, role } from "../../../app/utils/api-handler";
import { normalizeDoi } from "../../../app/utils/doi";

export default handler(
  method(METHOD.PATCH),
  role([ROLE.CONTENT_ADMIN, ROLE.CELLXGENE_ADMIN]),
  async (req, res) => {
    const dois = (await taskCellxGeneInProgressSchema.validate(req.body)).map(
      normalizeDoi,
    );
    res
      .status(200)
      .json(
        await updateSourceStudyTaskStatusesByDois(
          dois,
          VALIDATION_ID.SOURCE_STUDY_IN_CELLXGENE,
          TASK_STATUS.IN_PROGRESS,
        ),
      );
  },
);
