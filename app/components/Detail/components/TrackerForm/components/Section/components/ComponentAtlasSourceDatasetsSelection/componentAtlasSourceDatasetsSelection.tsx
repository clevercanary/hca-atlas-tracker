import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../common/entities";
import { DialogBody } from "../../../../../../../common/Form/components/Dialog/components/DialogBody/dialogBody";
import { FIELD_NAME } from "../../../../../ViewComponentAtlasSourceDatasetsSelection/common/constants";
import { useComponentAtlasSourceDatasetsSelectionForm } from "../../../../../ViewComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionForm";
import { useComponentAtlasSourceDatasetsSelectionFormManager } from "../../../../../ViewComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionFormManager";
import { FormActions } from "./components/FormActions/formActions";
import { Table } from "./components/FormContent/components/Table/table";

export interface ComponentAtlasSourceDatasetsSelectionProps {
  atlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  onClose: () => void;
  pathParameter: PathParameter;
}

export const ComponentAtlasSourceDatasetsSelection = ({
  atlasSourceDatasets,
  componentAtlasSourceDatasets,
  onClose,
  pathParameter,
}: ComponentAtlasSourceDatasetsSelectionProps): JSX.Element => {
  const formMethod = useComponentAtlasSourceDatasetsSelectionForm(
    componentAtlasSourceDatasets
  );
  const formManager = useComponentAtlasSourceDatasetsSelectionFormManager(
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
        <Table
          formMethod={formMethod}
          atlasSourceDatasets={atlasSourceDatasets}
        />
      )}
      formManager={formManager}
      formMethod={formMethod}
      onClose={onClose}
      title="Link source datasets"
    />
  );
};
