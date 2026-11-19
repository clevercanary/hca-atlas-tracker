import {
  FILE_KIND_LABEL,
  OWNER_LABEL,
  PRIORITY_BORDER,
  PRIORITY_CHIP,
  VERDICT_CHIP,
  VERDICT_LABEL,
} from "@/app/views/AtlasStatusView/components/CurationReport/constants";
import {
  StyledCheck,
  StyledChecks,
  StyledCountRow,
  StyledEvidence,
  StyledFacts,
  StyledIssue,
  StyledIssueTop,
  StyledReport,
  StyledSection,
  StyledTitleRow,
} from "@/app/views/AtlasStatusView/components/CurationReport/curationReport.styles";
import {
  type CurationReport,
  type ReportFile,
} from "@/app/views/AtlasStatusView/components/CurationReport/types";
import {
  describeValidator,
  formatCount,
  getIssuesByPriority,
} from "@/app/views/AtlasStatusView/components/CurationReport/utils";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Chip, Typography } from "@mui/material";
import Link from "next/link";
import { type JSX, type ReactNode } from "react";

interface Props {
  backHref: string;
  file: ReportFile;
  report: CurationReport;
}

const Heading = ({ children }: { children: ReactNode }): JSX.Element => (
  <Typography
    color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
    component="h3"
    variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_XSMALL}
  >
    {children}
  </Typography>
);

const Fact = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element => (
  <div>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
      component="dt"
      variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
    >
      {label}
    </Typography>
    <Typography
      color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
      component="dd"
      variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
    >
      {value}
    </Typography>
  </div>
);

const Small = ({
  children,
  light,
}: {
  children: ReactNode;
  light?: boolean;
}): JSX.Element => (
  <Typography
    color={
      light ? TYPOGRAPHY_PROPS.COLOR.INK_LIGHT : TYPOGRAPHY_PROPS.COLOR.INK_MAIN
    }
    variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_400}
  >
    {children}
  </Typography>
);

export const FileDetail = ({ backHref, file, report }: Props): JSX.Element => {
  const { facts, genes, sourceComparison } = file;
  return (
    <StyledReport>
      <Link href={backHref}>← Curation report</Link>
      <StyledSection>
        <StyledTitleRow>
          <Typography
            color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
            component="h2"
            variant={TYPOGRAPHY_PROPS.VARIANT.HEADING_SMALL}
          >
            {file.displayName}
          </Typography>
          <Chip label={FILE_KIND_LABEL[file.kind]} />
          <Chip
            color={VERDICT_CHIP[file.verdict]}
            label={VERDICT_LABEL[file.verdict]}
          />
        </StyledTitleRow>
        <Small light>
          {facts.title ?? "No title"} · {file.fileStem}
        </Small>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
        >
          {file.verdictReason}
        </Typography>
      </StyledSection>
      <StyledFacts component="dl" elevation={0}>
        <Fact label="Cells" value={file.cells.toLocaleString("en-US")} />
        <Fact label="Genes" value={facts.genes.toLocaleString("en-US")} />
        <Fact label="Size" value={facts.size} />
        <Fact
          label="X"
          value={`${facts.xState}${facts.hasRawX ? ", with raw counts" : ""}`}
        />
        <Fact label="Donors" value={formatCount(facts.donors)} />
        <Fact label="Samples" value={formatCount(facts.samples)} />
        <Fact label="Libraries" value={formatCount(facts.libraries)} />
        <Fact label="Tracker revision" value={facts.trackerRevision} />
        <Fact
          label="HCA schema validator"
          value={describeValidator(facts.schemaValidator)}
        />
        <Fact
          label="Cell annotation validator"
          value={describeValidator(facts.cellAnnotationValidator)}
        />
        <Fact label="CAP status" value={facts.capStatus} />
      </StyledFacts>
      <StyledSection>
        <Heading>Needs work</Heading>
        {file.needsWork.length === 0 && <Small light>Nothing found.</Small>}
        {getIssuesByPriority(file).map(([priority, issues]) =>
          issues.map((issue, index) => (
            <StyledIssue
              borderColor={PRIORITY_BORDER[priority]}
              elevation={0}
              key={`${issue.id}-${index}`}
            >
              <StyledIssueTop>
                <Chip color={PRIORITY_CHIP[priority]} label={`P${priority}`} />
                <Typography
                  color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
                  variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
                >
                  {issue.title}
                </Typography>
                <Small light>{issue.category}</Small>
              </StyledIssueTop>
              <Small light>{issue.detail}</Small>
              <Typography
                color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
                variant={TYPOGRAPHY_PROPS.VARIANT.BODY_SMALL_500}
              >
                Fix: {OWNER_LABEL[issue.owner]}
                {issue.tool && <code> {issue.tool}</code>}
              </Typography>
              {issue.evidence && (
                <StyledEvidence>{issue.evidence}</StyledEvidence>
              )}
            </StyledIssue>
          )),
        )}
      </StyledSection>
      <StyledSection>
        <Heading>Genes</Heading>
        <Typography
          color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
          variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}
        >
          {genes.summary}
        </Typography>
        <StyledFacts component="dl" elevation={0}>
          {Object.entries(genes.byClass)
            .filter(([, count]) => count > 0)
            .map(([geneClass, count]) => (
              <Fact
                key={geneClass}
                label={geneClass.replaceAll("_", " ")}
                value={count.toLocaleString("en-US")}
              />
            ))}
        </StyledFacts>
        {genes.items.map((item) => (
          <StyledCountRow key={item.title}>
            <Small>
              P{item.priority} · {item.title}: {item.detail}
            </Small>
            <Small light>{OWNER_LABEL[item.owner]}</Small>
          </StyledCountRow>
        ))}
      </StyledSection>
      {sourceComparison && (
        <StyledSection>
          <Heading>Source comparison</Heading>
          <Small>
            {sourceComparison.compared.toLocaleString("en-US")} of{" "}
            {sourceComparison.cells.toLocaleString("en-US")} cells compared with
            their source dataset;{" "}
            {sourceComparison.unaccounted.toLocaleString("en-US")} match no
            source and {sourceComparison.claimedTwice.toLocaleString("en-US")}{" "}
            match more than one. Differences found:{" "}
            {sourceComparison.differences}.
          </Small>
        </StyledSection>
      )}
      <StyledSection>
        <Heading>Looks good</Heading>
        <StyledChecks>
          {file.looksGood.map((check) => (
            <StyledCheck elevation={0} key={check.id}>
              <SuccessIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL} />
              <div>
                <Typography
                  color={TYPOGRAPHY_PROPS.COLOR.INK_MAIN}
                  variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
                >
                  {report.checks[check.id].title}
                </Typography>
                <Small light>{check.detail}</Small>
              </div>
            </StyledCheck>
          ))}
        </StyledChecks>
      </StyledSection>
    </StyledReport>
  );
};
