import { RowDetail } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowPreview/components/Section/components/RowDetail/rowDetail";
import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { Divider } from "@mui/material";
import { Table } from "@tanstack/react-table";
import { Fragment } from "react";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Description } from "./components/Section/components/Description/description";

interface PreviewTaskProps {
  columns?: ColumnConfig<HCAAtlasTrackerListValidationRecord>[];
  expanded?: boolean;
  minColumns?: number;
  tableInstance: Table<HCAAtlasTrackerListValidationRecord>;
}

export const PreviewTask = ({
  columns,
  expanded = true,
  minColumns = 7,
  tableInstance,
}: PreviewTaskProps): JSX.Element | null => {
  const { getRowPreviewRow } = tableInstance;
  const { original: rowData } = getRowPreviewRow() || {};
  if (!rowData) return null;
  return (
    <Fragment>
      {columns && columns.length > 0 && (
        <Fragment>
          <RowDetail<HCAAtlasTrackerListValidationRecord>
            columns={columns}
            expanded={expanded}
            minColumns={minColumns}
            tableInstance={tableInstance}
          />
          <Divider />
        </Fragment>
      )}
      <Description task={rowData} />
    </Fragment>
  );
};
