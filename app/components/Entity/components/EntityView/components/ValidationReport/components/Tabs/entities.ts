import {
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../common/entities";
import { RouteValue } from "../../../../../../../../routes/entities";

export interface Props {
  pathParameter?: PathParameter;
  validationReports?: FileValidationReports | null;
  validationRoute: RouteValue;
  validatorName?: FileValidatorName;
}
