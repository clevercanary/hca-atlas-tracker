import { Grid } from "@databiosphere/findable-ui/lib/components/common/Grid/grid";
import { SYSTEM_DISPLAY_NAMES } from "../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { TitleValidation } from "./components/TitleValidation/titleValidation";

interface TaskDescriptionSystemCellProps {
  task: HCAAtlasTrackerListValidationRecord;
}

export const TaskDescriptionSystemCell = ({
  task,
}: TaskDescriptionSystemCellProps): JSX.Element => {
  return (
    <Grid gridSx={{ gap: 1 }}>
      <span>{getTaskDescription(task)}</span>
      <TitleValidation task={task} />
    </Grid>
  );
};

/**
 * Returns the task description.
 * @param task - Task.
 * @returns task description.
 */
function getTaskDescription(task: HCAAtlasTrackerListValidationRecord): string {
  const { description, system } = task;
  return `${description.trim().slice(0, -1)} in ${
    SYSTEM_DISPLAY_NAMES[system]
  }.`;
}
