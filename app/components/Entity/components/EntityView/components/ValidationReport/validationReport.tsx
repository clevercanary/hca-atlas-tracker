import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import Router from "next/router";
import { JSX, useEffect, useMemo } from "react";
import { getRouteURL } from "../../../../../../common/utils";
import { ReportContent } from "./components/ReportContent/reportContent";
import { Tabs } from "./components/Tabs/tabs";
import { getValidatorNames } from "./components/Tabs/utils";
import { Props } from "./entities";

export const ValidationReport = ({
  pathParameter,
  reprocessedStatus,
  validationReports,
  validationRoute,
  validationStatus,
  validatorName,
}: Props): JSX.Element | null => {
  const validatorNames = useMemo(
    () => getValidatorNames(validationReports, reprocessedStatus),
    [validationReports, reprocessedStatus],
  );

  const isValidatorHidden = Boolean(
    validatorName && !validatorNames.includes(validatorName),
  );

  useEffect(() => {
    if (!isValidatorHidden) return;
    const [fallback] = validatorNames;
    if (!fallback) return;
    Router.replace(
      getRouteURL(validationRoute, {
        ...pathParameter,
        validatorName: fallback,
      }),
    );
  }, [isValidatorHidden, pathParameter, validationRoute, validatorNames]);

  if (!validationStatus) return null; // `validationStatus` is a required field; an undefined value implies the data is not yet available.
  if (isValidatorHidden) return null; // Redirecting to a visible validator; avoid rendering hidden-validator content.
  return (
    <FluidPaper>
      <Tabs
        pathParameter={pathParameter}
        validationReports={validationReports}
        validationRoute={validationRoute}
        validatorName={validatorName}
        validatorNames={validatorNames}
      />
      <ReportContent
        validationReports={validationReports}
        validationStatus={validationStatus}
        validatorName={validatorName}
      />
    </FluidPaper>
  );
};
