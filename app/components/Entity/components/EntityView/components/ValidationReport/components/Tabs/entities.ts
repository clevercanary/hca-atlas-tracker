import {
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../common/entities";

export interface Props {
  pathParameter?: PathParameter;
  validationReports: FileValidationReports;
  validatorName: FileValidatorName;
}
