import { HCAAtlasTrackerSourceDataset } from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { Table as CommonTable } from "@/app/components/Entity/components/common/Table/table";
import { FormMethod } from "@/app/hooks/useForm/common/entities";
import { ComponentAtlasSourceDatasetsEditData } from "@/app/views/IntegratedObjectSourceDatasetsView/components/ViewComponentAtlasSourceDatasetsSelection/common/entities";
import { JSX } from "react";
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
