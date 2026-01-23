import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TAB_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/tab";
import { Tab } from "@mui/material";
import Router from "next/router";
import { SyntheticEvent, useCallback, useMemo } from "react";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FileValidatorName } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../../../../../common/utils";
import { Props } from "./entities";
import { StyledTabs } from "./tabs.styles";
import { getValidatorNames } from "./utils";

export const Tabs = ({
  pathParameter,
  validationReports,
  validationRoute,
  validatorName,
}: Props): JSX.Element | null => {
  const validatorNames = useMemo(
    () => getValidatorNames(validationReports),
    [validationReports],
  );

  const onChange = useCallback(
    (_: SyntheticEvent, validatorName: FileValidatorName) => {
      Router.push(
        getRouteURL(validationRoute, {
          ...pathParameter,
          validatorName,
        }),
      );
    },
    [pathParameter, validationRoute],
  );

  if (!validatorName || !validationReports) return null;

  return (
    <StyledTabs value={validatorName} onChange={onChange}>
      {validatorNames.map((validatorName) => (
        <Tab
          key={validatorName}
          icon={
            validationReports[validatorName]?.valid ? (
              <SuccessIcon
                color={SVG_ICON_PROPS.COLOR.SUCCESS}
                fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
              />
            ) : (
              <ErrorIcon
                color={SVG_ICON_PROPS.COLOR.ERROR}
                fontSize={SVG_ICON_PROPS.FONT_SIZE.SMALL}
              />
            )
          }
          iconPosition={TAB_PROPS.ICON_POSITION.START}
          label={FILE_VALIDATOR_NAME_LABEL[validatorName]}
          value={validatorName}
        />
      ))}
    </StyledTabs>
  );
};
