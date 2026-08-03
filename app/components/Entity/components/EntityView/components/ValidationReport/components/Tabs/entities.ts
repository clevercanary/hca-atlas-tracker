import {
  type FileValidationReports,
  type FileValidatorName,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type RouteValue } from "@/app/routes/entities";

export interface Props {
  pathParameter?: PathParameter;
  validationReports?: FileValidationReports | null;
  validationRoute: RouteValue;
  validatorName?: FileValidatorName;
  validatorNames: FileValidatorName[];
}
