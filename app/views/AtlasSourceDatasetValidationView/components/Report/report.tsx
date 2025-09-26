import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { Tabs } from "./components/Tabs/tabs";
import { StyledFluidPaper } from "./report.styles";

export const Report = (): JSX.Element | null => {
  const { data, pathParameter } = useEntity();
  const { sourceDataset } = data as EntityData;
  const { validatorName } = pathParameter || {};
  const { validationReports } = sourceDataset || {};

  if (!validatorName || !validationReports) return null;

  return (
    <StyledFluidPaper>
      <Tabs
        pathParameter={pathParameter}
        validationReports={validationReports}
        validatorName={validatorName}
      />
      <div>Validation Summary</div>
    </StyledFluidPaper>
  );
};
