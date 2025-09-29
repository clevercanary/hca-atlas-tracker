import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Link as MLink, Stack } from "@mui/material";
import Link from "next/link";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FileValidatorName } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { INNER_STACK_PROPS, STACK_PROPS } from "./constants";
import { Props } from "./entities";
import { StyledErrorIcon } from "./validationSummary.styles";

export const ValidationSummary = ({
  validationRoute,
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
            <SuccessIcon
              color={SVG_ICON_PROPS.COLOR.SUCCESS}
              fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
            />
          ) : (
            <StyledErrorIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL} />
          )}
          <MLink
            component={Link}
            href={validationRoute}
            rel={REL_ATTRIBUTE.NO_OPENER}
            target={ANCHOR_TARGET.SELF}
          >
            {FILE_VALIDATOR_NAME_LABEL[key as FileValidatorName]}
          </MLink>
        </Stack>
      ))}
    </Stack>
  );
};
