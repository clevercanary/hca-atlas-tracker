import { CHIP_PROPS } from "@databiosphere/findable-ui/lib/styles/common/mui/chip";
import { JSX } from "react";
import {
  FILE_VALIDATION_STATUS,
  INTEGRITY_STATUS,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { ValidationStatus } from "./components/ValidationStatus/validationStatus";
import { ValidationStatusChipCell } from "./components/ValidationStatusChipCell/validationStatusChipCell";
import { ValidationSummary } from "./components/ValidationSummary/validationSummary";
import { Props } from "./entities";

export const ValidationStatusCell = ({
  componentAtlasId,
  row,
  sourceDatasetId,
  validationRoute,
}: Props): JSX.Element | null => {
  const { original } = row;
  const { atlasId, integrityStatus, validationStatus, validationSummary } =
    original;
  const reprocessedStatus =
    "reprocessedStatus" in original ? original.reprocessedStatus : undefined;

  // Render validation results if validation status is completed.
  if (validationStatus === FILE_VALIDATION_STATUS.COMPLETED) {
    if (validationSummary !== null)
      // Render summary if present
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
    else if (integrityStatus === INTEGRITY_STATUS.INVALID)
      // If summary is absent, integrity should be invalid and a chip is rendered
      return (
        <ValidationStatusChipCell
          color={CHIP_PROPS.COLOR.ERROR}
          label="Integrity failed"
        />
      );
    else
      // If both types of result are somehow missing, render a fallback to communicate this
      return (
        <ValidationStatusChipCell
          color={CHIP_PROPS.COLOR.DEFAULT}
          label="Results not found"
        />
      );
  }

  // Render validation status otherwise.
  return <ValidationStatus validationStatus={validationStatus} />;
};
