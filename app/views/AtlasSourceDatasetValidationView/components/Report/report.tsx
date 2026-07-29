import { ValidationReport } from "@/app/components/Entity/components/EntityView/components/ValidationReport/validationReport";
import { useEntity } from "@/app/providers/entity/hook";
import { ROUTE } from "@/app/routes/constants";
import { EntityData } from "@/app/views/AtlasSourceDatasetValidationView/entities";
import { JSX } from "react";

export const Report = (): JSX.Element | null => {
  const { data, pathParameter } = useEntity();
  const { sourceDataset } = data as EntityData;
  const { validatorName } = pathParameter || {};
  const { reprocessedStatus, validationReports, validationStatus } =
    sourceDataset || {};

  if (!pathParameter) return null;

  return (
    <ValidationReport
      pathParameter={pathParameter}
      reprocessedStatus={reprocessedStatus}
      validationReports={validationReports}
      validationRoute={ROUTE.ATLAS_SOURCE_DATASET_VALIDATION}
      validationStatus={validationStatus}
      validatorName={validatorName}
    />
  );
};
