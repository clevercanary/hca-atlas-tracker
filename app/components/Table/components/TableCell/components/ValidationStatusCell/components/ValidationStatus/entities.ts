import { FILE_VALIDATION_STATUS } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props {
  validationErrorMessage: string | null;
  validationStatus: FILE_VALIDATION_STATUS;
}
