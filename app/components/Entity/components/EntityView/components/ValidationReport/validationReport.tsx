import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { ReportContent } from "./components/ReportContent/reportContent";
import { Tabs } from "./components/Tabs/tabs";
import { Props } from "./entities";

export const ValidationReport = ({
  pathParameter,
  validationReports,
  validationStatus,
  validatorName,
}: Props): JSX.Element | null => {
  if (!validationStatus) return null; // `validationStatus` is a required field; an undefined value implies the data is not yet available.
  return (
    <FluidPaper>
      <Tabs
        pathParameter={pathParameter}
        validationReports={validationReports}
        validatorName={validatorName}
      />
      <ReportContent
        validationReports={validationReports}
        validationStatus={validationStatus}
        validatorName={validatorName}
      />
    </FluidPaper>
  );
};
