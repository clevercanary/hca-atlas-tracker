import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidatorName,
  REPROCESSED_STATUS,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { RouteValue } from "@/app/routes/entities";

export interface Props {
  pathParameter: PathParameter;
  reprocessedStatus?: REPROCESSED_STATUS;
  validationReports?: FileValidationReports | null;
  validationRoute: RouteValue;
  validationStatus?: FILE_VALIDATION_STATUS;
  validatorName?: FileValidatorName;
}
