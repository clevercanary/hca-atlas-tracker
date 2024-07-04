import { CellContext } from "@tanstack/react-table";
import { BaseSyntheticEvent } from "react";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Button } from "./taskDescriptionCell.styles";

interface TaskDescriptionSystemCellProps<TData> {
  cellContext?: CellContext<HCAAtlasTrackerListValidationRecord, TData>;
  task: HCAAtlasTrackerListValidationRecord;
}

export const TaskDescriptionCell = <TData,>({
  cellContext,
  task,
}: TaskDescriptionSystemCellProps<TData>): JSX.Element => {
  const { description } = task;
  return (
    <Button
      onClick={(e: BaseSyntheticEvent): void => {
        e.preventDefault();
        cellContext?.row.togglePreview();
      }}
    >
      {description}
    </Button>
  );
};
