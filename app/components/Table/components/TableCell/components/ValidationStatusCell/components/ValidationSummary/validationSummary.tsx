import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import {
  ANCHOR_TARGET,
  REL_ATTRIBUTE,
} from "@databiosphere/findable-ui/lib/components/Links/common/entities";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Link as MLink, Stack, Tooltip } from "@mui/material";
import Link from "next/link";
import { JSX } from "react";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FileValidatorName } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FILE_VALIDATOR_DESCRIPTIONS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/validatorDescriptions";
import { getRouteURL } from "../../../../../../../../common/utils";
import { INNER_STACK_PROPS, STACK_PROPS } from "./constants";
import { Props } from "./entities";
import { getValidators } from "./utils";
import { StyledErrorIcon } from "./validationSummary.styles";

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
    <Stack {...STACK_PROPS}>
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
            title={FILE_VALIDATOR_DESCRIPTIONS[key as FileValidatorName]}
          >
            <Stack {...INNER_STACK_PROPS}>
              {value.valid ? (
                <SuccessIcon
                  color={SVG_ICON_PROPS.COLOR.SUCCESS}
                  fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
                />
              ) : (
                <StyledErrorIcon fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL} />
              )}

              <MLink
                as={url}
                component={Link}
                href={{ pathname: url, query: { from: "list" } }}
                rel={REL_ATTRIBUTE.NO_OPENER}
                target={ANCHOR_TARGET.SELF}
              >
                {FILE_VALIDATOR_NAME_LABEL[key as FileValidatorName]}
              </MLink>
            </Stack>
          </Tooltip>
        );
      })}
    </Stack>
  );
};
