import {
  StyledChip,
  StyledSection,
  StyledTitleRow,
} from "@/app/views/AtlasStatusView/components/CurationReport/curationReport.styles";
import {
  type CurationReport,
  FILE_KIND,
  VERDICT,
  type Verdict,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { type JSX } from "react";

interface Props {
  report: CurationReport;
  verdictCounts: Record<Verdict, number>;
}

export const ReportSummary = ({
  report,
  verdictCounts,
}: Props): JSX.Element => {
  const objects = report.files.filter(
    (file) => file.kind === FILE_KIND.INTEGRATED_OBJECT,
  ).length;
  const sources = report.files.length - objects;
  const ready = verdictCounts[VERDICT.READY];
  return (
    <StyledSection>
      <StyledTitleRow>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
          component="h2"
          variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_SMALL}
        >
          Curation report
        </Typography>
        <StyledChip
          color={ready === report.files.length ? "success" : "error"}
          label={`${ready} of ${report.files.length} ready`}
        />
      </StyledTitleRow>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
      >
        Evaluated {report.reportDate} · {objects} integrated objects · {sources}{" "}
        source datasets · generation {report.generation}
      </Typography>
      <Typography
        color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
        variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
      >
        {report.lede}
      </Typography>
    </StyledSection>
  );
};
