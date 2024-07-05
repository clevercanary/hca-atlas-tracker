import { RowDetail } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowPreview/components/Section/components/RowDetail/rowDetail";
import { ColumnConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { Divider } from "@mui/material";
import { Fragment } from "react";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Description } from "./components/Section/components/Description/description";

interface PreviewTaskProps {
  columns?: ColumnConfig<HCAAtlasTrackerListValidationRecord>[];
  expanded?: boolean;
  minColumns?: number;
  task: HCAAtlasTrackerListValidationRecord;
}

export const PreviewTask = ({
  columns,
  expanded = true,
  minColumns = 7,
  task,
}: PreviewTaskProps): JSX.Element | null => {
  if (!task) return null;
  return (
    <Fragment>
      {columns && columns.length > 0 && (
        <Fragment>
          <RowDetail<HCAAtlasTrackerListValidationRecord>
            columns={columns}
            expanded={expanded}
            minColumns={minColumns}
            rowData={task}
          />
          <Divider />
        </Fragment>
      )}
      <Description task={task} />
    </Fragment>
  );
};
