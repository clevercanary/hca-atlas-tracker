import { Section } from "@databiosphere/findable-ui/lib/components/Table/components/TableToolbar/components/RowPreview/components/Section/section";
import { TEXT_BODY_400_2_LINES } from "@databiosphere/findable-ui/lib/theme/common/typography";
import { Typography } from "@mui/material";
import { Fragment } from "react";
import { SYSTEM_DISPLAY_NAMES } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { HCAAtlasTrackerListValidationRecord } from "../../../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

interface DescriptionProps {
  task: HCAAtlasTrackerListValidationRecord;
}

export const Description = ({ task }: DescriptionProps): JSX.Element | null => {
  const { differences } = task;
  return (
    <Section title="Description">
      <Typography variant={TEXT_BODY_400_2_LINES}>
        <p>{getTaskDescription(task)}</p>
        {differences.map(({ actual, expected, variable }, i) =>
          Array.isArray(expected) && typeof actual !== "string" ? (
            <p key={`${variable}${i}`}>
              Missing {variable}:{" "}
              {expected.filter((value) => !actual?.includes(value)).join(", ")}
            </p>
          ) : (
            <Fragment key={`${variable}${i}`}>
              <p>Expected: {expected}</p>
              <p>Actual: {actual}</p>
            </Fragment>
          )
        )}
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
