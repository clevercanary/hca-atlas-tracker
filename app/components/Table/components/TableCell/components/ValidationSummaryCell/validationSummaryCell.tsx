import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
// import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Stack } from "@mui/material";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FileValidatorName } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { INNER_STACK_PROPS, STACK_PROPS, SVG_ICON_PROPS } from "./constants";
import { Props } from "./entities";
import { StyledErrorIcon } from "./validationSummaryCell.styles";

export const ValidationSummaryCell = ({
  validationSummary,
}: Props): JSX.Element | null => {
  if (!validationSummary) return null;

  const validators = Object.entries(validationSummary.validators);

  if (validators.length === 0) return null;

  return (
    <Stack {...STACK_PROPS}>
      {validators.map(([key, value]) => (
        <Stack key={key} {...INNER_STACK_PROPS}>
          {value ? (
            <SuccessIcon {...SVG_ICON_PROPS} color={SVG_ICON_PROPS.color} />
          ) : (
            <StyledErrorIcon {...SVG_ICON_PROPS} />
          )}
          {FILE_VALIDATOR_NAME_LABEL[key as FileValidatorName]}
        </Stack>
      ))}
    </Stack>
  );
};
