import { EditFileArchivedStatus } from "@/app/components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { useArchivedState } from "@/app/components/Entity/providers/archived/hook";
import { ATLAS } from "@/app/hooks/UseFetchAtlas/query/constants";
import { useEntity } from "@/app/providers/entity/hook";
import { SOURCE_DATASETS } from "@/app/views/AtlasSourceDatasetsView/hooks/UseFetchAtlasSourceDatasets/query/constants";
import { DropdownMenu } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowSelection/components/DropdownMenu/dropdownMenu";
import { Stack } from "@mui/material";
import { type JSX } from "react";
import { EditPublicationStatus } from "./components/EditPublicationStatus/editPublicationStatus";
import { EditReprocessedStatus } from "./components/EditReprocessedStatus/editReprocessedStatus";
import { SetSourceStudy } from "./components/SetSourceStudy/setSourceStudy";
import { type Props } from "./entities";

export const EditSelection = ({ rows, table }: Props): JSX.Element => {
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;
  const { pathParameter } = useEntity();
  const { atlasId } = pathParameter || {};

  return (
    <Stack direction="row" gap={2} useFlexGap>
      {!archived && (
        <DropdownMenu>
          {({ closeMenu }): JSX.Element[] => [
            <EditReprocessedStatus
              key="reprocessed-status"
              closeMenu={closeMenu}
              rows={rows}
              table={table}
            />,
            <EditPublicationStatus
              key="publication-status"
              closeMenu={closeMenu}
              rows={rows}
              table={table}
            />,
            <SetSourceStudy
              key="set-source-study"
              closeMenu={closeMenu}
              rows={rows}
              table={table}
            />,
          ]}
        </DropdownMenu>
      )}
      <EditFileArchivedStatus
        queryKeys={[
          [ATLAS, atlasId],
          [SOURCE_DATASETS, atlasId],
        ]}
        rows={rows}
        table={table}
      />
    </Stack>
  );
};
