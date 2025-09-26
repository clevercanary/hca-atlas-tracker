import { ValidationReport } from "../../../../components/Entity/components/EntityView/components/ValidationReport/validationReport";
import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";

export const Report = (): JSX.Element | null => {
  const { data, pathParameter } = useEntity();
  const { componentAtlas } = data as EntityData;
  const { validatorName } = pathParameter || {};
  const { validationReports } = componentAtlas || {};

  if (!validatorName || !validationReports) return null;

  return (
    <ValidationReport
      pathParameter={pathParameter!} // `validatorName` is defined and so we can be sure `pathParameter` is not null.
      validationReports={validationReports}
      validatorName={validatorName}
    />
  );
};
