import {
  FILE_VALIDATION_STATUS,
  FileValidationReports,
  FileValidatorName,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props {
  validationReports?: FileValidationReports | null;
  validationStatus: FILE_VALIDATION_STATUS;
  validatorName?: FileValidatorName;
}
