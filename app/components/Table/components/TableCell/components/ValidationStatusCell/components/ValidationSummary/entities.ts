import { FileValidationSummary } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";

export interface Props {
  validationRoute: string;
  validationSummary: FileValidationSummary | null;
}
