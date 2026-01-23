import { filesSetIsArchivedSchema } from "app/apis/catalog/hca-atlas-tracker/common/schema";
import { ROLE } from "../../../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../../../app/common/entities";
import { updateAtlasFilesArchiveStatus } from "../../../../../app/services/files";
import {
  handler,
  integrationLeadAssociatedAtlasOnly,
  method,
  role,
} from "../../../../../app/utils/api-handler";

export default handler(
  method(METHOD.PATCH),
  role([ROLE.CONTENT_ADMIN, ROLE.INTEGRATION_LEAD]),
  integrationLeadAssociatedAtlasOnly,
  async (req, res) => {
    const atlasId = req.query.atlasId as string;
    const { fileIds } = await filesSetIsArchivedSchema.validate(req.body);
    await updateAtlasFilesArchiveStatus(atlasId, fileIds, true);
    res.status(200).end();
  },
);
