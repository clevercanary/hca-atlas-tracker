import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../../../../../common/entities";
import { getAtlasComponentSourceDatasetsTableColumns } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { useUnlinkComponentAtlasSourceDatasets } from "../../../../../../../../../../../../views/ComponentAtlasView/hooks/useUnlinkComponentAtlasSourceDatasets";
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
  const { onUnlink } = useUnlinkComponentAtlasSourceDatasets(pathParameter);
  if (componentAtlasSourceDatasets.length === 0) return null;
  return (
    <SectionTable
      columns={getAtlasComponentSourceDatasetsTableColumns(onUnlink)}
      gridTemplateColumns="minmax(272px, 1fr) repeat(2, minmax(180px, 0.4fr)) repeat(4, minmax(88px, 128px)) auto"
      items={componentAtlasSourceDatasets}
      tableOptions={TABLE_OPTIONS}
    />
  );
};
