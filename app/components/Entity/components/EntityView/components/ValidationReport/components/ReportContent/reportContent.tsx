import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Stack, Typography } from "@mui/material";
import { JSX } from "react";
import { ValidationMessage } from "./components/ValidationMessage/validationMessage";
import { Props } from "./entities";
import { StyledStack } from "./reportContent.styles";
import { getReportSummaries } from "./utils";

/**
 * Renders the body of the per-validator validation report. When
 * `getReportSummaries` returns a list of summaries, renders each as a
 * severity-styled section: heading `{title}` followed by a stack of
 * `ValidationMessage` alert rows. When `getReportSummaries` returns a
 * string, renders that string as a fallback status message.
 * @param props - Component props.
 * @param props.validationReports - Map of per-validator reports for the file.
 * @param props.validationStatus - The overall file-validation status.
 * @param props.validatorName - The validator whose report should be rendered.
 * @returns The validation report content.
 */
export const ReportContent = ({
  validationReports,
  validationStatus,
  validatorName,
}: Props): JSX.Element => {
  const summaries = getReportSummaries(
    validationStatus,
    validationReports,
    validatorName,
  );

  if (typeof summaries === "string") {
    return (
      <StyledStack>
        <Typography variant={TYPOGRAPHY_PROPS.VARIANT.BODY_400}>
          {summaries}
        </Typography>
      </StyledStack>
    );
  }

  return (
    <>
      {summaries.map(({ messages, severity, title }) => (
        <StyledStack key={severity} spacing={5} useFlexGap>
          <Typography
            component="h3"
            variant={TYPOGRAPHY_PROPS.VARIANT.BODY_500}
          >
            {title}
          </Typography>
          <Stack role="list" spacing={2} useFlexGap>
            {messages.map((message, i) => (
              <ValidationMessage
                key={`${message}-${i}`}
                message={message}
                severity={severity}
              />
            ))}
          </Stack>
        </StyledStack>
      ))}
    </>
  );
};
