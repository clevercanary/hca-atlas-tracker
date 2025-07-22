import { EntityType, ValidationErrorInfo } from "../../entities";

export interface Props {
  columnValidationReports: Map<string, ValidationErrorInfo[]>;
  entityType: EntityType | "entrySheet";
  entrySheetId: string;
}
