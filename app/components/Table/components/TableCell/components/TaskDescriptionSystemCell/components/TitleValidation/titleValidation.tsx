import { Fragment } from "react";
import {
  HCAAtlasTrackerListValidationRecord,
  ValidationDifference,
  VALIDATION_STATUS,
  VALIDATION_VARIABLE,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

interface TitleValidationProps {
  task: HCAAtlasTrackerListValidationRecord;
}

export const TitleValidation = ({
  task,
}: TitleValidationProps): JSX.Element | null => {
  const { validationStatus } = task;
  const titleValidation = findTitleValidationVariable(task);
  if (!titleValidation) return null;
  if (validationStatus !== VALIDATION_STATUS.FAILED) return null;
  return (
    <Fragment>
      <span>Expected: {titleValidation.expected}</span>
      <span>Actual: {titleValidation.actual}</span>
    </Fragment>
  );
};

/**
 * Finds the validation difference with the title variable.
 * @param task - Task.
 * @returns validation difference with the title variable.
 */
function findTitleValidationVariable(
  task: HCAAtlasTrackerListValidationRecord
): ValidationDifference | undefined {
  return task.differences.find(
    ({ variable }) => variable === VALIDATION_VARIABLE.TITLE
  );
}
