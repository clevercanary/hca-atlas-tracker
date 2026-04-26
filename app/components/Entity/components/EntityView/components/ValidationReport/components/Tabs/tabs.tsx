import { STACK_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/stack";
import { Stack, Tab, Tooltip } from "@mui/material";
import Router from "next/router";
import { JSX, SyntheticEvent, useCallback } from "react";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FileValidatorName } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { FILE_VALIDATOR_DESCRIPTIONS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/validatorDescriptions";
import { getRouteURL } from "../../../../../../../../common/utils";
import { Icon } from "../../../../../../../Table/components/TableCell/components/ValidationStatusCell/components/ValidationSummary/components/Icon/icon";
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
                <Icon
                  status={{
                    errorCount: validationReports[name]?.errors.length ?? 0,
                    warningCount: validationReports[name]?.warnings.length ?? 0,
                  }}
                />
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
