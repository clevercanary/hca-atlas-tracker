import { HCAAtlasTrackerSourceDataset } from "../../../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../../../../../common/entities";
import { getAtlasComponentSourceDatasetsTableColumns } from "../../../../../../../../../../../../viewModelBuilders/catalog/hca-atlas-tracker/common/viewModelBuilders";
import { useUnlinkComponentAtlasSourceDatasets } from "../../../../../../../../../../../../views/ComponentAtlasView/hooks/useUnlinkComponentAtlasSourceDatasets";
import { SectionTable } from "../../../../../../section.styles";
import { TABLE_OPTIONS } from "./common/constants";
import { getGridTemplateColumns } from "./common/utils";

export interface TableProps {
  canEdit: boolean;
  componentAtlasSourceDatasets: HCAAtlasTrackerSourceDataset[];
  pathParameter: PathParameter;
}

export const Table = ({
  canEdit,
  componentAtlasSourceDatasets = [],
  pathParameter,
}: TableProps): JSX.Element => {
  if (pathParameter.atlasId === undefined)
    throw new Error("Missing atlas ID path parameter");
  const { onUnlink } = useUnlinkComponentAtlasSourceDatasets(pathParameter);
  return (
    <SectionTable
      columns={getAtlasComponentSourceDatasetsTableColumns(
        onUnlink,
        canEdit,
        pathParameter.atlasId
      )}
      gridTemplateColumns={getGridTemplateColumns(canEdit)}
      items={componentAtlasSourceDatasets}
      tableOptions={{ ...TABLE_OPTIONS, getRowId: (row) => row.id }}
    />
  );
};
