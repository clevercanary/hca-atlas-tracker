import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { GridPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/paper.styles";
import { useReactTable } from "@tanstack/react-table";
import { Table as CommonTable } from "../../../../components/Entity/components/common/Table/table";
import { TablePlaceholder } from "../../../../components/Table/components/TablePlaceholder/tablePlaceholder";
import { CORE_OPTIONS } from "../../../../components/Table/options/core/constants";
import { SORTING_OPTIONS } from "../../../../components/Table/options/sorting/constants";
import { useEntity } from "../../../../providers/entity/hook";
import { Entity, EntityData } from "../../entities";
import { RowSelection } from "./components/RowSelection/rowSelection";
import { Props } from "./entities";
import { StyledToolbar } from "./table.styles";

export const Table = (props: Props): JSX.Element => {
  const { data, formManager } = useEntity() as Entity;
  const { atlasSourceDatasets = [] } = data as EntityData;
  const { tableOptions } = props;
  const {
    access: { canEdit },
  } = formManager;

  // Create table instance.
  const table = useReactTable({
    data: atlasSourceDatasets,
    ...CORE_OPTIONS,
    ...SORTING_OPTIONS,
    ...tableOptions,
    meta: { canEdit },
  });

  return (
    <FluidPaper elevation={0}>
      <GridPaper>
        <StyledToolbar>
          <RowSelection table={table} />
        </StyledToolbar>
        {table.getRowCount() > 0 && <CommonTable table={table} />}
        <TablePlaceholder
          message="No source datasets"
          rowCount={table.getRowCount()}
        />
      </GridPaper>
    </FluidPaper>
  );
};
