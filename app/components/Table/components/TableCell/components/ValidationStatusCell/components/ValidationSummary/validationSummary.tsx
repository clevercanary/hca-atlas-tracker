import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
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
import { ValidatorIcon } from "./components/ValidatorIcon/validatorIcon";
import { INNER_STACK_PROPS, STACK_PROPS } from "./constants";
import { Props } from "./entities";
import { getValidatorCountLabel, getValidators } from "./utils";
import { StyledStack } from "./validationSummary.styles";

export const ValidationSummary = ({
  atlasId,
  componentAtlasId,
  reprocessedStatus,
  sourceDatasetId,
  validationRoute,
  validationSummary,
}: Props): JSX.Element | null => {
  if (!validationSummary) return null;

  const validators = getValidators(validationSummary, reprocessedStatus);

  if (validators.length === 0) return null;

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
            disableInteractive={false}
            key={key}
            title={renderTooltipTitle(key as FileValidatorName, value)}
          >
            <Stack {...INNER_STACK_PROPS}>
              <ValidatorIcon status={value} />
              <Link
                as={url}
                href={{ pathname: url, query: { from: "list" } }}
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
