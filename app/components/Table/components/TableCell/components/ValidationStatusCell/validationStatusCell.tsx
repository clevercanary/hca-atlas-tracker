import { JSX } from "react";
import { FILE_VALIDATION_STATUS } from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ValidationStatus } from "./components/ValidationStatus/validationStatus";
import { ValidationSummary } from "./components/ValidationSummary/validationSummary";
import { Props } from "./entities";

export const ValidationStatusCell = ({
  componentAtlasId,
  row,
  sourceDatasetId,
  validationRoute,
}: Props): JSX.Element | null => {
  const { original } = row;
  const { atlasId, validationStatus, validationSummary } = original;
  const reprocessedStatus =
    "reprocessedStatus" in original ? original.reprocessedStatus : undefined;

  // Render validation summary if validation status is completed.
  if (validationStatus === FILE_VALIDATION_STATUS.COMPLETED)
    return (
      <ValidationSummary
        atlasId={atlasId}
        componentAtlasId={componentAtlasId}
        reprocessedStatus={reprocessedStatus}
        sourceDatasetId={sourceDatasetId}
        validationRoute={validationRoute}
        validationSummary={validationSummary}
      />
    );

  // Render validation status otherwise.
  return <ValidationStatus validationStatus={validationStatus} />;
};
