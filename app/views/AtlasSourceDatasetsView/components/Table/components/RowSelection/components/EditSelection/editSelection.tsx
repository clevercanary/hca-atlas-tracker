import { DropdownMenu } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowSelection/components/DropdownMenu/dropdownMenu";
import { Stack } from "@mui/material";
import { EditFileArchivedStatus } from "../../../../../../../../components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { useArchivedState } from "../../../../../../../../components/Entity/providers/archived/hook";
import { ATLAS } from "../../../../../../../../hooks/useFetchAtlas";
import { SOURCE_DATASETS } from "../../../../../../hooks/useFetchAtlasSourceDatasets";
import { EditReprocessedStatus } from "./components/EditReprocessedStatus/editReprocessedStatus";
import { SetSourceStudy } from "./components/SetSourceStudy/setSourceStudy";
import { Props } from "./entities";

export const EditSelection = ({ rows, table }: Props): JSX.Element => {
  const { archivedState } = useArchivedState();
  const { archived } = archivedState;
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
        fetchKeys={[ATLAS, SOURCE_DATASETS]}
        rows={rows}
        table={table}
      />
    </Stack>
  );
};
