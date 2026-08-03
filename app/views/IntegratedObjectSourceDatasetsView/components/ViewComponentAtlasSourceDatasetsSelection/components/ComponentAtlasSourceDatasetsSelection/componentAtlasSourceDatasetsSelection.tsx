import { type HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { DialogBody } from "@/app/components/common/Form/components/Dialog/components/DialogBody/dialogBody";
import { FIELD_NAME } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/constants";
import { useComponentAtlasSourceDatasetsSelectionForm } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionForm";
import { useComponentAtlasSourceDatasetsSelectionFormManager } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/hooks/useComponentAtlasSourceDatasetsSelectionFormManager";
import { type JSX } from "react";
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
    componentAtlasSourceDatasets,
  );
  const formManager = useComponentAtlasSourceDatasetsSelectionFormManager(
    pathParameter,
    formMethod,
    onClose,
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
