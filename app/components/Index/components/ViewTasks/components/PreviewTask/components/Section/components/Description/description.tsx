import { Section } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowPreview/components/Section/section";
import { TEXT_BODY_400_2_LINES } from "@databiosphere/findable-ui/lib/theme/common/typography";
import { Typography } from "@mui/material";
import { Fragment } from "react";
import {
  CASE_INSENSITIVE_ARRAY_VALIDATION_VARIABLES,
  SYSTEM_DISPLAY_NAMES,
} from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

interface DescriptionProps {
  task: HCAAtlasTrackerListValidationRecord;
}

export const Description = ({ task }: DescriptionProps): JSX.Element | null => {
  return (
    <Section title="Description">
      <Typography variant={TEXT_BODY_400_2_LINES}>
        <p>{getTaskDescription(task)}</p>
        {getTaskDifferences(task)}
      </Typography>
    </Section>
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

function getTaskDifferences(
  task: HCAAtlasTrackerListValidationRecord
): JSX.Element {
  return (
    <>
      {task.differences.map(({ actual, expected, variable }, i) => {
        if (Array.isArray(expected) && typeof actual !== "string") {
          const caseSensitive =
            !CASE_INSENSITIVE_ARRAY_VALIDATION_VARIABLES.has(variable);
          const missing = getUnsharedValues(
            expected,
            actual,
            caseSensitive
          ).join(", ");
          const extra =
            actual &&
            getUnsharedValues(actual, expected, caseSensitive).join(", ");
          return (
            <Fragment key={`${variable}${i}`}>
              {missing && (
                <p>
                  Missing {variable}: {missing}
                </p>
              )}
              {extra && (
                <p>
                  Extra {variable}: {extra}
                </p>
              )}
            </Fragment>
          );
        } else {
          return (
            <Fragment key={`${variable}${i}`}>
              <p>Expected: {expected}</p>
              <p>Actual: {actual}</p>
            </Fragment>
          );
        }
      })}
    </>
  );
}

function getUnsharedValues(
  fromArray: string[],
  byArray: string[] | null,
  caseSensitive = true
): string[] {
  if (!byArray) return fromArray;
  if (!caseSensitive) byArray = byArray.map((value) => value.toLowerCase());
  return fromArray.filter(
    (value) => !byArray?.includes(caseSensitive ? value : value.toLowerCase())
  );
}
