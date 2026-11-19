import { ROLE } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "@/app/common/entities";
import { validateAllFiles } from "@/app/services/files";
import { bearerAllowed, handler, method, role } from "@/app/utils/api-handler";

/**
 * API route for starting validation of all latest-version source dataset and integrated object files.
 * Allowed for API tokens, so that scripts and agents can start a full revalidation (e.g. after a validator is deployed).
 */
export default handler(
  method(METHOD.POST),
  bearerAllowed,
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    validateAllFiles().catch((e) => {
      console.error("Encountered error while validating files:", e);
    });
    res.status(202).end();
  },
);
