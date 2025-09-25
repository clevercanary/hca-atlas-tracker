import { CellContext } from "@tanstack/react-table";
import {
  FILE_VALIDATION_STATUS,
  HCAAtlasTrackerComponentAtlas,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { AtlasSourceDataset } from "../../../../../../views/AtlasSourceDatasetsView/entities";
import { ValidationStatus } from "./components/ValidationStatus/validationStatus";
import { ValidationSummary } from "./components/ValidationSummary/validationSummary";

export const ValidationStatusCell = <
  T extends HCAAtlasTrackerComponentAtlas | AtlasSourceDataset,
  TValue
>({
  row,
}: CellContext<T, TValue>): JSX.Element | null => {
  const { original } = row;
  const { validationStatus, validationSummary } = original;

  // Render validation summary if validation status is completed.
  if (validationStatus === FILE_VALIDATION_STATUS.COMPLETED)
    return <ValidationSummary validationSummary={validationSummary} />;

  // Render validation status otherwise.
  return <ValidationStatus validationStatus={validationStatus} />;
};
