import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { Props } from "./entities";
import { StyledContainer } from "./reportContent.styles";

export const ReportContent = ({
  validationReports,
  validatorName,
}: Props): JSX.Element | null => {
  const { errors = [], warnings = [] } = validationReports[validatorName] || {};
  const messages = [...errors, ...warnings].filter(Boolean);
  return (
    <StyledContainer maxWidth={false}>
      <Typography variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_BODY_400}>
        {messages.map((message) => (
          <div key={message}>{message}</div>
        ))}
      </Typography>
    </StyledContainer>
  );
};
