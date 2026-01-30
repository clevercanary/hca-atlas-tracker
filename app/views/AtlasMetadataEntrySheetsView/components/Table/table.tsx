import { JSX } from "react";
import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useReactTable } from "@tanstack/react-table";
import { Table as CommonTable } from "../../../../components/Entity/components/common/Table/table";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { CORE_OPTIONS } from "../../../../components/Table/options/core/constants";
import { SORTING_OPTIONS } from "../../../../components/Table/options/sorting/constants";
import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { Props } from "./entities";

export const Table = (props: Props): JSX.Element => {
  const { data } = useEntity();
  const { entrySheets = [] } = data as EntityData;
  const { tableOptions } = props;

  // Create table instance.
  const table = useReactTable({
    data: entrySheets,
    ...CORE_OPTIONS,
    ...SORTING_OPTIONS,
    ...tableOptions,
  });

  return (
    <FluidPaper elevation={0}>
      <GridPaper>
        {table.getRowCount() > 0 && <CommonTable table={table} />}
        <TablePlaceholder
          message="No metadata entry sheets"
          rowCount={table.getRowCount()}
        />
      </GridPaper>
    </FluidPaper>
  );
};
