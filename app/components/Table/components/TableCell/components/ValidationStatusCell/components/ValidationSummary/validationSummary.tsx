import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { Stack, Tooltip } from "@mui/material";
import Link from "next/link";
import { JSX, ReactNode } from "react";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import {
  FileValidatorName,
  ValidatorSummaryStatus,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FILE_VALIDATOR_DESCRIPTIONS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/validatorDescriptions";
import { getRouteURL } from "../../../../../../../../common/utils";
import { ValidationStatusChipCell } from "../ValidationStatusChipCell/validationStatusChipCell";
import { ValidatorIcon } from "./components/ValidatorIcon/validatorIcon";
import { INNER_STACK_PROPS, STACK_PROPS } from "./constants";
import { Props } from "./entities";
import { getValidatorCountLabel, getValidators } from "./utils";
import { StyledStack } from "./validationSummary.styles";

export const ValidationSummary = ({
  atlasId,
  backOrigin,
  componentAtlasId,
  reprocessedStatus,
  sourceDatasetId,
  validationRoute,
  validationSummary,
}: Props): JSX.Element | null => {
  const validators = getValidators(validationSummary, reprocessedStatus);

  if (validators.length === 0)
    return (
      <ValidationStatusChipCell
        color={CHIP_PROPS.COLOR.DEFAULT}
        label="No relevant results"
      />
    );

  return (
    <StyledStack {...STACK_PROPS}>
      {validators.map(([key, value]) => {
        const url = getRouteURL(validationRoute, {
          atlasId,
          componentAtlasId,
          sourceDatasetId,
          validatorName: key as FileValidatorName,
        });
        return (
          <Tooltip
            arrow
            disableInteractive={false}
            key={key}
            placement="right"
            title={renderTooltipTitle(key as FileValidatorName, value)}
          >
            <Stack {...INNER_STACK_PROPS}>
              <ValidatorIcon status={value} />
              <Link
                as={url}
                href={{ pathname: url, query: { from: backOrigin } }}
                rel={REL_ATTRIBUTE.NO_OPENER}
                target={ANCHOR_TARGET.SELF}
              >
                {FILE_VALIDATOR_NAME_LABEL[key as FileValidatorName]}
              </Link>
            </Stack>
          </Tooltip>
        );
      })}
    </StyledStack>
  );
};

/**
 * Renders the tooltip title for a validator entry.
 * @param validatorName - Validator name.
 * @param status - Validator summary status.
 * @returns Tooltip title with description and count label.
 */
function renderTooltipTitle(
  validatorName: FileValidatorName,
  status: ValidatorSummaryStatus,
): ReactNode {
  return (
    <Stack spacing={2} useFlexGap>
      <div>{FILE_VALIDATOR_DESCRIPTIONS[validatorName]}</div>
      <div>{getValidatorCountLabel(status)}</div>
    </Stack>
  );
}
