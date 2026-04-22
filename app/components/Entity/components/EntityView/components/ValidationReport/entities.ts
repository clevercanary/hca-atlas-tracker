import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidatorName,
  REPROCESSED_STATUS,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../common/entities";
import { RouteValue } from "../../../../../../routes/entities";

export interface Props {
  pathParameter: PathParameter;
  reprocessedStatus?: REPROCESSED_STATUS;
  validationReports?: FileValidationReports | null;
  validationRoute: RouteValue;
  validationStatus?: FILE_VALIDATION_STATUS;
  validatorName?: FileValidatorName;
}
