import { EntityType, ValidationErrorInfo } from "../../entities";

export interface Props {
  entityType: EntityType;
  entrySheetId: string;
  validationReports: ValidationErrorInfo[];
}
