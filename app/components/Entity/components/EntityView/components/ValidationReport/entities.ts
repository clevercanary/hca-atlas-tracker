import {
  type FILE_VALIDATION_STATUS,
  type FileValidationReports,
  type FileValidatorName,
  type REPROCESSED_STATUS,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type RouteValue } from "@/app/routes/entities";

export interface Props {
  pathParameter: PathParameter;
  reprocessedStatus?: REPROCESSED_STATUS;
  validationReports?: FileValidationReports | null;
  validationRoute: RouteValue;
  validationStatus?: FILE_VALIDATION_STATUS;
  validatorName?: FileValidatorName;
}
