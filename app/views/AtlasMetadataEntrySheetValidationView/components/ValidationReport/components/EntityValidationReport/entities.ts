import { EntityType, ValidationErrorInfo } from "../../entities";

export interface Props {
  entityType: EntityType | null;
  entrySheetId: string;
  validationReports: ValidationErrorInfo[];
}
