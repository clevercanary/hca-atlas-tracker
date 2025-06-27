import { TYPOGRAPHY_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/typography";
import { Typography } from "@mui/material";
import { Fragment } from "react";
import { SectionHero } from "../../../../components/Entity/components/EntityView/components/Section/section.styles";
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
      <SectionHero>
        <Typography
          component="h2"
          variant={TYPOGRAPHY_PROPS.VARIANT.TEXT_HEADING_XSMALL}
        >
          Validation Report
        </Typography>
      </SectionHero>
      {[...entityValidationReports].map(
        ([entityType, validationReports], i) => (
          <EntityValidationReport
            key={i}
            entityType={entityType}
            entrySheetId={entrySheetId}
            validationReports={validationReports}
          />
        )
      )}
    </Fragment>
  );
};
