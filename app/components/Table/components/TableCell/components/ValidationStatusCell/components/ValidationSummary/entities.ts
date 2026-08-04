import {
  type FileValidationSummary,
  type REPROCESSED_STATUS,
} from "@/app/apis/catalog/hca-atlas-tracker/common/entities";
import { type PathParameter } from "@/app/common/entities";
import { type BackOrigin } from "@/app/components/Layout/components/Detail/components/DetailViewHero/components/BackButton/constants";
import { type RouteValue } from "@/app/routes/entities";

export interface Props extends PathParameter {
  backOrigin: BackOrigin;
  reprocessedStatus?: REPROCESSED_STATUS;
  validationErrorMessage: string | null;
  validationRoute: RouteValue;
  validationSummary: FileValidationSummary;
}
