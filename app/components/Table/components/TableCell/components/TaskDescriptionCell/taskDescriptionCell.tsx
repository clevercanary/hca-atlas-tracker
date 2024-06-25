import { useRowPreview } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowPreview/hooks/useRowPreview";
import { BaseSyntheticEvent } from "react";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { Button } from "./taskDescriptionCell.styles";

interface TaskDescriptionSystemCellProps {
  task: HCAAtlasTrackerListValidationRecord;
}

export const TaskDescriptionCell = ({
  task,
}: TaskDescriptionSystemCellProps): JSX.Element => {
  const { onPreviewRow } = useRowPreview();
  const { description, id } = task;
  return (
    <Button
      onClick={(e: BaseSyntheticEvent): void => {
        e.preventDefault();
        onPreviewRow({ id, original: task });
      }}
    >
      {description}
    </Button>
  );
};
