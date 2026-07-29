import {
  FileValidationSummary,
  REPROCESSED_STATUS,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { PathParameter } from "@/app/common/entities";
import { BackOrigin } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";
import { RouteValue } from "@/app/routes/entities";

export interface Props extends PathParameter {
  backOrigin: BackOrigin;
  reprocessedStatus?: REPROCESSED_STATUS;
  validationErrorMessage: string | null;
  validationRoute: RouteValue;
  validationSummary: FileValidationSummary;
}
