import { DropdownMenu } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowSelection/components/DropdownMenu/dropdownMenu";
import { Fragment } from "react";
import { EditReprocessedStatus } from "./components/EditReprocessedStatus/editReprocessedStatus";
import { Props } from "./entities";

export const EditSelection = ({ rows, table }: Props): JSX.Element => {
  return (
    <Fragment>
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
    </Fragment>
  );
};
