import { FileValidationSummary } from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../common/entities";
import { RouteValue } from "../../../../../../../../routes/entities";

export interface Props extends PathParameter {
  validationRoute: RouteValue;
  validationSummary: FileValidationSummary | null;
}
