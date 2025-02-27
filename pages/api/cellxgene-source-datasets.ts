import { getCellxGeneSourceDatasets } from "app/services/source-datasets";
import { METHOD } from "../../app/common/entities";
import { handler, method } from "../../app/utils/api-handler";

export default handler(method(METHOD.GET), async (req, res) => {
  const cellxgeneIds = (await getCellxGeneSourceDatasets()).map(
    (dataset) => dataset.sd_info.cellxgeneDatasetId
  );
  res.json(cellxgeneIds);
});
