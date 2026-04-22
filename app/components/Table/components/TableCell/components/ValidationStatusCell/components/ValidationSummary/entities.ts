import {
  FileValidationSummary,
  REPROCESSED_STATUS,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../common/entities";
import { RouteValue } from "../../../../../../../../routes/entities";

export interface Props extends PathParameter {
  reprocessedStatus?: REPROCESSED_STATUS;
  validationRoute: RouteValue;
  validationSummary: FileValidationSummary | null;
}
