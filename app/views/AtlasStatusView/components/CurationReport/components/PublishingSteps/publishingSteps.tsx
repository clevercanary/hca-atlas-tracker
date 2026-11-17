import { IssueCard } from "@/app/views/AtlasStatusView/components/CurationReport/components/IssueCard/issueCard";
import { ReportSection } from "@/app/views/AtlasStatusView/components/CurationReport/components/ReportSection/reportSection";
import { PUBLISHING_STEPS_NOTE } from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import { getPublishingStepChip } from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { Stack } from "@mui/material";
import { type JSX } from "react";
import { type Props } from "./types";

export const PublishingSteps = ({ steps }: Props): JSX.Element | null => {
  if (!steps.length) return null;
  const chip = getPublishingStepChip();
  return (
    <ReportSection
      description={PUBLISHING_STEPS_NOTE}
      subtitle={`${steps.length} left`}
      title="Publishing steps"
    >
      <Stack gap={1}>
        {steps.map((step) => (
          <IssueCard
            key={step.id}
            issue={step}
            label={chip.label}
            labelColor={chip.color}
          />
        ))}
      </Stack>
    </ReportSection>
  );
};
