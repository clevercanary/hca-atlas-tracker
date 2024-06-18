import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../../../../../common/entities";
import { getAtlasComponentSourceDatasetsTableColumns } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { useDeleteComponentAtlasSourceDatasets } from "../../../../../../../../../../../../views/ComponentAtlasView/hooks/useDeleteComponentAtlasSourceDatasets";
import { SectionTable } from "../../../../../../section.styles";
import { TABLE_OPTIONS } from "./common/constants";

export interface TableProps {
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  pathParameter: PathParameter;
}

export const Table = ({
  componentAtlasSourceDatasets = [],
  pathParameter,
}: TableProps): JSX.Element | null => {
  const { onDelete } = useDeleteComponentAtlasSourceDatasets(pathParameter);
  if (componentAtlasSourceDatasets.length === 0) return null;
  return (
    <SectionTable
      columns={getAtlasComponentSourceDatasetsTableColumns(onDelete)}
      gridTemplateColumns="minmax(272px, 1fr) minmax(202px, 1fr) auto auto"
      items={componentAtlasSourceDatasets}
      tableOptions={TABLE_OPTIONS}
    />
  );
};
