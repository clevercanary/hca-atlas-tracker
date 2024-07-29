import { ROLE } from "../../app/apis/catalog/hca-atlas-tracker/common/entities";
import { METHOD } from "../../app/common/entities";
import {
  forceCellxGeneRefresh,
  getCellxGeneStatus,
} from "../../app/services/cellxgene";
import { RefreshServicesStatuses } from "../../app/services/common/entities";
import {
  forceProjectsRefresh,
  getProjectsStatus,
} from "../../app/services/hca-projects";
import { handleByMethod, handler, role } from "../../app/utils/api-handler";

const getHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  const statuses: RefreshServicesStatuses = {
    cellxgene: getCellxGeneStatus(),
    hca: getProjectsStatus(),
  };
  res.status(200).json(statuses);
});

const postHandler = handler(role(ROLE.CONTENT_ADMIN), async (req, res) => {
  forceProjectsRefresh();
  forceCellxGeneRefresh();
  res.status(202).end();
});

export default handleByMethod({
  [METHOD.GET]: getHandler,
  [METHOD.POST]: postHandler,
});
