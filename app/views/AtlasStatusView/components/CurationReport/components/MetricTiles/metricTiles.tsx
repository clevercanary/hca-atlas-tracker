import {
  OWNER_LABEL,
  PRIORITIES,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  StyledChip,
  StyledCountRow,
  StyledTile,
  StyledTiles,
} from "@/app/views/AtlasStatusView/components/CurationReport/curationReport.styles";
import {
  type ClearedCheck,
  type IssueCounts,
  VERDICT,
  type Verdict,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { getOwnersByCount } from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { type JSX, type ReactNode } from "react";

interface Props {
  clearedChecks: ClearedCheck[];
  fileCount: number;
  issueCounts: IssueCounts;
  verdictCounts: Record<Verdict, number>;
}

interface TileProps {
  children?: ReactNode;
  label: string;
  value: string;
}

const Tile = ({ children, label, value }: TileProps): JSX.Element => (
  <StyledTile elevation={0}>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
      variant={TYPOGRAPHY_PROPS.VARIANT.UPPERCASE_500}
    >
      {label}
    </Typography>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
      variant={TYPOGRAPHY_PROPS.VARIANT.HEADING}
    >
      {value}
    </Typography>
    {children}
  </StyledTile>
);

const CountRow = ({
  count,
  label,
}: {
  count: number;
  label: string;
}): JSX.Element => (
  <StyledCountRow>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
      variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
    >
      {label}
    </Typography>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
      variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
    >
      {count}
    </Typography>
  </StyledCountRow>
);

export const MetricTiles = ({
  clearedChecks,
  fileCount,
  issueCounts,
  verdictCounts,
}: Props): JSX.Element => {
  const ready = verdictCounts[VERDICT.READY];
  const needsWork = verdictCounts[VERDICT.NEEDS_WORK];
  const passedByAll = clearedChecks.filter(
    (check) => check.passed === fileCount,
  ).length;
  const owners = getOwnersByCount(issueCounts.byOwner).filter(
    ([, count]) => count > 0,
  );
  return (
    <StyledTiles>
      <Tile label="Files ready" value={`${ready} / ${fileCount}`}>
        <CountRow count={needsWork} label="Need work" />
        <CountRow
          count={verdictCounts[VERDICT.NOT_STARTED]}
          label="Not started"
        />
      </Tile>
      <Tile label="Open issues" value={String(issueCounts.total)}>
        {PRIORITIES.map((priority) => (
          <CountRow
            count={issueCounts.byPriority[priority]}
            key={priority}
            label={`Priority ${priority}`}
          />
        ))}
      </Tile>
      <Tile label="Who fixes them" value={`${owners.length} owners`}>
        {owners.map(([owner, count]) => (
          <CountRow count={count} key={owner} label={OWNER_LABEL[owner]} />
        ))}
      </Tile>
      <Tile label="Cleared checks" value={`${passedByAll} checks`}>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
        >
          passed by every file
        </Typography>
        <StyledChip
          color="success"
          label={`${clearedChecks.length - passedByAll} more pass on most files`}
        />
      </Tile>
    </StyledTiles>
  );
};
