import { validateAllFiles } from "app/services/files";
import { ROLE } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import { handler, method, role } from "../../app/utils/api-handler";

export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    validateAllFiles().catch((e) => {
      console.error("Encountered error while validating files:", e);
    });
    res.status(202).end();
  }
);
