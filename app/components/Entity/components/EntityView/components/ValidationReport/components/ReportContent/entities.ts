import {
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props {
  validationReports: FileValidationReports;
  validatorName: FileValidatorName;
}
