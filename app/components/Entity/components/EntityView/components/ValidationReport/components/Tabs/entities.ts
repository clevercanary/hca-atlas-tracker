import {
  FileValidationReports,
  FileValidatorName,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { RouteValue } from "@/app/routes/entities";

export interface Props {
  pathParameter?: PathParameter;
  validationReports?: FileValidationReports | null;
  validationRoute: RouteValue;
  validatorName?: FileValidatorName;
  validatorNames: FileValidatorName[];
}
