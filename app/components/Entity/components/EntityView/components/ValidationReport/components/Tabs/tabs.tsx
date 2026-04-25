import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { STACK_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/stack";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { Stack, Tab, Tooltip } from "@mui/material";
import Router from "next/router";
import { JSX, SyntheticEvent, useCallback } from "react";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FileValidatorName } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FILE_VALIDATOR_DESCRIPTIONS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/validatorDescriptions";
import { getRouteURL } from "../../../../../../../../common/utils";
import { Props } from "./entities";
import { StyledTabs } from "./tabs.styles";

export const Tabs = ({
  pathParameter,
  validationReports,
  validationRoute,
  validatorName,
  validatorNames,
}: Props): JSX.Element | null => {
  const onChange = useCallback(
    (_: SyntheticEvent, name: FileValidatorName) => {
      Router.push(
        getRouteURL(validationRoute, {
          ...pathParameter,
          validatorName: name,
        }),
      );
    },
    [pathParameter, validationRoute],
  );

  if (!validatorName || !validationReports) return null;

  return (
    <StyledTabs value={validatorName} onChange={onChange}>
      {validatorNames.map((name) => (
        <Tab
          key={name}
          label={
            <Tooltip
              disableInteractive={false}
              title={FILE_VALIDATOR_DESCRIPTIONS[name]}
            >
              <Stack
                direction={STACK_PROPS.DIRECTION.ROW}
                spacing={2}
                useFlexGap
              >
                {validationReports[name]?.valid ? (
                  <SuccessIcon
                    color={SVG_ICON_PROPS.COLOR.SUCCESS}
                    fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
                  />
                ) : (
                  <ErrorIcon
                    color={SVG_ICON_PROPS.COLOR.ERROR}
                    fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
                  />
                )}
                {FILE_VALIDATOR_NAME_LABEL[name]}
              </Stack>
            </Tooltip>
          }
          value={name}
        />
      ))}
    </StyledTabs>
  );
};
