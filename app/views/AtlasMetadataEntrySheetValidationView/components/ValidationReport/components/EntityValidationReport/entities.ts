import { EntityType, ValidationErrorInfo } from "../../entities";

export interface Props {
  entityType: EntityType | "entrySheet";
  entrySheetId: string;
  validationReports: ValidationErrorInfo[];
}
