import { IssueCard } from "@/app/views/AtlasStatusView/components/CurationReport/components/IssueCard/issueCard";
import {
  PRIORITIES,
  PRIORITY_COLOR,
  PRIORITY_DESCRIPTION,
  PRIORITY_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Chip, Typography } from "@mui/material";
import { type JSX } from "react";
import { StyledGroup, StyledGroupHeader, StyledList } from "./issueList.styles";
import { type Props } from "./types";

export const IssueList = ({ issues, showEvidence }: Props): JSX.Element => {
  if (!issues.length) {
    return (
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
      >
        Nothing needs work.
      </Typography>
    );
  }
  return (
    <StyledList>
      {PRIORITIES.map((priority) => {
        const group = issues.filter((issue) => issue.priority === priority);
        if (!group.length) return null;
        return (
          <StyledGroup key={priority}>
            <StyledGroupHeader>
              <Chip
                color={PRIORITY_COLOR[priority]}
                label={`${PRIORITY_LABEL[priority]} · ${group.length}`}
                variant={CHIP_PROPS.VARIANT.STATUS}
              />
              <Typography
                color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
                variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
              >
                {PRIORITY_DESCRIPTION[priority]}
              </Typography>
            </StyledGroupHeader>
            {group.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                showEvidence={showEvidence}
              />
            ))}
          </StyledGroup>
        );
      })}
    </StyledList>
  );
};
