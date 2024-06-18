import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../common/entities";
import { DialogBody } from "../../../../../../../common/Form/components/Dialog/components/DialogBody/dialogBody";
import { FIELD_NAME } from "../../../../../ViewSourceStudiesSourceDatasets/common/constants";
import { useFetchSourceStudiesSourceDatasets } from "../../../../../ViewSourceStudiesSourceDatasets/hooks/useFetchSourceStudiesSourceDatasets";
import { useSourceStudiesSourceDatasetsForm } from "../../../../../ViewSourceStudiesSourceDatasets/hooks/useSourceStudiesSourceDatasetsForm";
import { useSourceStudiesSourceDatasetsFormManager } from "../../../../../ViewSourceStudiesSourceDatasets/hooks/useSourceStudiesSourceDatasetsFormManager";
import { FormActions } from "./components/FormActions/formActions";
import { FormContent } from "./components/FormContent/formContent";

export interface SourceStudiesSourceDatasetsProps {
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  onClose: () => void;
  pathParameter: PathParameter;
}

export const SourceStudiesSourceDatasets = ({
  componentAtlasSourceDatasets,
  onClose,
  pathParameter,
}: SourceStudiesSourceDatasetsProps): JSX.Element => {
  const sourceStudiesSourceDatasets =
    useFetchSourceStudiesSourceDatasets(pathParameter);
  const formMethod = useSourceStudiesSourceDatasetsForm(
    componentAtlasSourceDatasets
  );
  const formManager = useSourceStudiesSourceDatasetsFormManager(
    pathParameter,
    formMethod,
    onClose
  );
  const { watch } = formMethod;
  const sourceDatasetIds = watch(FIELD_NAME.SOURCE_DATASET_IDS);
  return (
    <DialogBody
      actions={({ formManager }): JSX.Element => (
        <FormActions
          count={sourceDatasetIds.length}
          formManager={formManager}
        />
      )}
      content={({ formMethod }): JSX.Element => (
        <FormContent
          formMethod={formMethod}
          sourceStudiesSourceDatasets={sourceStudiesSourceDatasets}
        />
      )}
      formManager={formManager}
      formMethod={formMethod}
      onClose={onClose}
      title="Link source datasets"
    />
  );
};
