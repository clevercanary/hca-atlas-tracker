import { ValidationReport } from "../../../../components/Entity/components/EntityView/components/ValidationReport/validationReport";
import { useEntity } from "../../../../providers/entity/hook";
import { ROUTE } from "../../../../routes/constants";
import { EntityData } from "../../entities";

export const Report = (): JSX.Element | null => {
  const { data, pathParameter } = useEntity();
  const { componentAtlas } = data as EntityData;
  const { validatorName } = pathParameter || {};
  const { validationReports, validationStatus } = componentAtlas || {};

  if (!pathParameter) return null;

  return (
    <ValidationReport
      pathParameter={pathParameter}
      validationReports={validationReports}
      validationRoute={ROUTE.INTEGRATED_OBJECT_VALIDATION}
      validationStatus={validationStatus}
      validatorName={validatorName}
    />
  );
};
