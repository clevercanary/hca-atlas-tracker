import {
  type EntityType,
  type ValidationErrorInfo,
} from "@/app/views/AtlasMetadataEntrySheetValidationView/components/ValidationReport/entities";

export interface Props {
  columnValidationReports: Map<string, ValidationErrorInfo[]>;
  entityType: EntityType | "entrySheet";
  entrySheetId: string;
}
