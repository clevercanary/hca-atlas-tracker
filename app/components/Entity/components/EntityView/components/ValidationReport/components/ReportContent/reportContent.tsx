import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { Props } from "./entities";
import { StyledContainer } from "./reportContent.styles";
import { getReportValues } from "./utils";

export const ReportContent = ({
  validationReports,
  validationStatus,
  validatorName,
}: Props): JSX.Element => {
  return (
    <StyledContainer maxWidth={false}>
      <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}>
        {getReportValues(
          validationStatus,
          validationReports,
          validatorName
        ).map((value, i) => (
          <div key={i}>{value}</div>
        ))}
      </Typography>
    </StyledContainer>
  );
};
