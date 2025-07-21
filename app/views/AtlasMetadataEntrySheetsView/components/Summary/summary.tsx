import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { RoundedPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/RoundedPaper/roundedPaper";
import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { SUMMARY_KEY_VALUES, SVG_ICON_PROPS } from "./constants";
import { StyledGrid, StyledTypography } from "./summary.styles";
import { getValidationSummaryCounts } from "./utils";

export const Summary = (): JSX.Element => {
  const { data } = useEntity();
  const { entrySheets = [] } = data as EntityData;
  const summary = getValidationSummaryCounts(entrySheets);
  return (
    <StyledGrid>
      {SUMMARY_KEY_VALUES.map(([key, value]) => {
        const count = summary[key] ?? 0;
        return (
          <RoundedPaper elevation={0} key={key}>
            <Typography
              color={TYPOGRAPHY_PROPS.COLOR.INK_LIGHT}
              // TODO(cc) update heading variant with typography props
              variant={"text-body-small-500"}
            >
              {value}
            </Typography>
            <StyledTypography
              summaryCount={count}
              summaryKey={key}
              // TODO(cc) update heading variant with typography props
              variant={"text-heading"}
            >
              {count}
              {count > 0 ? (
                <ErrorIcon {...SVG_ICON_PROPS} />
              ) : (
                <SuccessIcon {...SVG_ICON_PROPS} />
              )}
            </StyledTypography>
          </RoundedPaper>
        );
      })}
    </StyledGrid>
  );
};
