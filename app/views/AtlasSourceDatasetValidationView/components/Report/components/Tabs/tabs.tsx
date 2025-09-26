import { ErrorIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/ErrorIcon/errorIcon";
import { SuccessIcon } from "@databiosphere/findable-ui/lib/components/common/CustomIcon/components/SuccessIcon/successIcon";
import { SVG_ICON_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/svgIcon";
import { TAB_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/tab";
import { Tab } from "@mui/material";
import Router from "next/router";
import { SyntheticEvent, useCallback, useMemo } from "react";
import { FILE_VALIDATOR_NAME_LABEL } from "../../../../../../apis/catalog/hca-atlas-tracker/common/constants";
import { FileValidatorName } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { getRouteURL } from "../../../../../../common/utils";
import { ROUTE } from "../../../../../../routes/constants";
import { Props } from "./entities";
import { StyledTabs } from "./tabs.styles";

export const Tabs = ({
  pathParameter,
  validationReports,
  validatorName,
}: Props): JSX.Element => {
  const validatorNames = useMemo(
    () => Object.keys(validationReports),
    [validationReports]
  ) as FileValidatorName[];

  const onChange = useCallback(
    (_: SyntheticEvent, validatorName: FileValidatorName) => {
      Router.push(
        getRouteURL(ROUTE.ATLAS_SOURCE_DATASET_VALIDATION, {
          ...pathParameter,
          validatorName,
        })
      );
    },
    [pathParameter]
  );

  return (
    <StyledTabs value={validatorName} onChange={onChange} variant="fullWidth">
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
