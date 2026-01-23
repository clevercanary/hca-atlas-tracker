import { ROLE } from "../../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../../app/common/entities";
import { addIntegrationLeadsFromAtlases } from "../../../app/services/users";
import { handler, method, role } from "../../../app/utils/api-handler";

export default handler(
  method(METHOD.PATCH),
  role(ROLE.CONTENT_ADMIN),
  async (req, res) => {
    await addIntegrationLeadsFromAtlases();
    res.status(200).end();
  },
);
