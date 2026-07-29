import { JSX } from "react";
import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Table as CommonTable } from "../../../../../../../../../../components/Entity/components/common/Table/table";
import { FormMethod } from "../../../../../../../../../../hooks/useForm/common/entities";
import { ComponentAtlasSourceDatasetsEditData } from "../../../../../../common/entities";
import { useComponentAtlasSourceDatasetsSelectionTable } from "./hooks/UseComponentAtlasSourceDatasetsSelectionTable/hook";

export interface TableProps {
  atlasSourceDatasets?: HCAAtlasTrackerSourceDataset[];
  formMethod: FormMethod<
    ComponentAtlasSourceDatasetsEditData,
    HCAAtlasTrackerSourceDataset[]
  >;
}

export const Table = ({
  atlasSourceDatasets,
  formMethod,
}: TableProps): JSX.Element => {
  const { table } = useComponentAtlasSourceDatasetsSelectionTable(
    formMethod,
    atlasSourceDatasets,
  );
  return <CommonTable stickyHeader table={table} />;
};
