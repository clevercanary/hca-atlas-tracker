import {
  AtlasId,
  EntrySheetValidationId,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface ValidationSummaryCellProps {
  atlasId: AtlasId;
  entrySheetValidationId: EntrySheetValidationId;
  errorCount: number;
}
