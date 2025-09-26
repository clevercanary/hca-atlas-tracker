import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../common/entities";

export interface Props {
  pathParameter: PathParameter;
  validationReports?: FileValidationReports | null;
  validationStatus?: FILE_VALIDATION_STATUS;
  validatorName?: FileValidatorName;
}
