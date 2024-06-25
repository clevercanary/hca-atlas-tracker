import { RowDetail } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowPreview/components/Section/components/RowDetail/rowDetail";
import { ListConfig } from "@databiosphere/findable-ui/lib/config/entities";
import { Divider } from "@mui/material";
import { Fragment } from "react";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Description } from "./components/Section/components/Description/description";

interface PreviewTaskProps {
  columns?: ListConfig<HCAAtlasTrackerListValidationRecord>["columns"];
  rowData?: HCAAtlasTrackerListValidationRecord;
}

export const PreviewTask = ({
  columns,
  rowData,
}: PreviewTaskProps): JSX.Element | null => {
  if (!rowData) return null;
  const previewColumns: ListConfig<HCAAtlasTrackerListValidationRecord>["columns"] =
    [];
  for (const column of columns || []) {
    const { componentConfig } = column;
    if (
      componentConfig.component.name === "BasicCell" ||
      componentConfig.component.name === "Link"
    ) {
      previewColumns.push({
        ...column,
        componentConfig: {
          ...componentConfig,
          props: { noWrap: true },
        },
      });
      continue;
    }
    previewColumns.push(column);
  }
  return (
    <Fragment>
      {columns && columns.length > 0 && (
        <Fragment>
          <RowDetail
            columns={previewColumns}
            minColumns={7}
            rowData={rowData}
          />
          <Divider />
        </Fragment>
      )}
      <Description task={rowData} />
    </Fragment>
  );
};
