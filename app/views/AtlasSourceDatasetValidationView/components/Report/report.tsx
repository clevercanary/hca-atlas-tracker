import { JSX } from "react";
import { ValidationReport } from "../../../../components/Entity/components/EntityView/components/ValidationReport/validationReport";
import { useEntity } from "../../../../providers/entity/hook";
import { ROUTE } from "../../../../routes/constants";
import { EntityData } from "../../entities";

export const Report = (): JSX.Element | null => {
  const { data, pathParameter } = useEntity();
  const { sourceDataset } = data as EntityData;
  const { validatorName } = pathParameter || {};
  const { validationReports, validationStatus } = sourceDataset || {};

  if (!pathParameter) return null;

  return (
    <ValidationReport
      pathParameter={pathParameter}
      validationReports={validationReports}
      validationRoute={ROUTE.ATLAS_SOURCE_DATASET_VALIDATION}
      validationStatus={validationStatus}
      validatorName={validatorName}
    />
  );
};
