import { DropdownMenu } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowSelection/components/DropdownMenu/dropdownMenu";
import { Stack } from "@mui/material";
import { EditFileArchivedStatus } from "../../../../../../../../components/Entity/components/common/Table/components/TableFeatures/RowSelection/components/EditFileArchivedStatus/editFileArchivedStatus";
import { EditReprocessedStatus } from "./components/EditReprocessedStatus/editReprocessedStatus";
import { Props } from "./entities";

export const EditSelection = ({ rows, table }: Props): JSX.Element => {
  return (
    <Stack direction="row" gap={2} useFlexGap>
      <DropdownMenu>
        {({ closeMenu }): JSX.Element[] => [
          <EditReprocessedStatus
            key="reprocessed-status"
            closeMenu={closeMenu}
            rows={rows}
            table={table}
          />,
        ]}
      </DropdownMenu>
      <EditFileArchivedStatus rows={rows} table={table} />
    </Stack>
  );
};
