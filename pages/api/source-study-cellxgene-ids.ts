import { getCellxGeneSourceStudies } from "app/services/source-studies";
import { METHOD } from "../../app/common/entities";
import { handler, method } from "../../app/utils/api-handler";

export default handler(method(METHOD.GET), async (req, res) => {
  const cellxgeneIds = (await getCellxGeneSourceStudies()).map(
    (study) => study.study_info.cellxgeneCollectionId
  );
  res.json(cellxgeneIds);
});
