import { FluidPaper } from "@databiosphere/findable-ui/lib/components/common/Paper/components/FluidPaper/fluidPaper";
import { ReportContent } from "./components/ReportContent/reportContent";
import { Tabs } from "./components/Tabs/tabs";
import { Props } from "./entities";

export const ValidationReport = ({
  pathParameter,
  validationReports,
  validatorName,
}: Props): JSX.Element => {
  return (
    <FluidPaper>
      <Tabs
        pathParameter={pathParameter}
        validationReports={validationReports}
        validatorName={validatorName}
      />
      <ReportContent
        validationReports={validationReports}
        validatorName={validatorName}
      />
    </FluidPaper>
  );
};
