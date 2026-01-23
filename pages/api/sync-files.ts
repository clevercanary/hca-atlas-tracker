import { syncFilesFromS3 } from "app/services/s3-sync";
import { ROLE } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import { handler, method, role } from "../../app/utils/api-handler";

export default handler(
  method(METHOD.POST),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    syncFilesFromS3().catch((e) => {
      console.error("Encountered error while syncing from S3");
      console.error(e);
    });
    res.status(202).end();
  },
);
