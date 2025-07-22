import { Fragment } from "react";
import { useEntity } from "../../../../providers/entity/hook";
import { EntityData } from "../../entities";
import { EntityValidationReport } from "./components/EntityValidationReport/entityValidationReport";
import { buildEntityValidationReports } from "./utils";

export const ValidationReport = (): JSX.Element | null => {
  const { data } = useEntity();

  // Coerce the entity data provided by EntityProvider to the EntityData type -- safe to assume that the data structure conforms to EntityData.
  const entityData = data as EntityData;

  // Build validation reports for each entity.
  const entityValidationReports = buildEntityValidationReports(entityData);

  if (!entityValidationReports) return null;

  const { entrySheetValidation } = entityData;
  const { entrySheetId } = entrySheetValidation || {};

  // If entry sheet ID is not available, return null.
  if (!entrySheetId) return null;

  return (
    <Fragment>
      {[...entityValidationReports].map(
        ([entityType, validationReports], i) => (
          <EntityValidationReport
            key={i}
            columnValidationReports={validationReports}
            entityType={entityType}
            entrySheetId={entrySheetId}
          />
        )
      )}
    </Fragment>
  );
};
