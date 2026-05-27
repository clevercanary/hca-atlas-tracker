import {
  FileValidationSummary,
  REPROCESSED_STATUS,
} from "../../../../../../../../apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "../../../../../../../../common/entities";
import { RouteValue } from "../../../../../../../../routes/entities";
import { BackOrigin } from "../../../../../../../Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";

export interface Props extends PathParameter {
  backOrigin: BackOrigin;
  reprocessedStatus?: REPROCESSED_STATUS;
  validationErrorMessage: string | null;
  validationRoute: RouteValue;
  validationSummary: FileValidationSummary;
}
