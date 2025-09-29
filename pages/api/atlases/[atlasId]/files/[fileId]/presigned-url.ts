import { ROLE } from "../../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../../app/common/entities";
import { getAtlasFileDownloadUrl } from "../../../../../../app/services/files";
import {
  handler,
  integrationLeadAssociatedAtlasOnly,
  method,
  role,
} from "../../../../../../app/utils/api-handler";

/**
 * API route for getting a presigned download URL for a given file of a given atlas.
 */
export default handler(
  method(METHOD.POST),
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const fileId = req.query.fileId as string;
    res.status(200).json(await getAtlasFileDownloadUrl(atlasId, fileId));
  }
);
